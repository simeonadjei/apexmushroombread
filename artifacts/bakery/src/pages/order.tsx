import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useCreateOrder, useVerifyOrderPayment, Order as OrderType } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle2, Copy, Loader2, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

const formSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  customerAddress: z.string().min(5, "Address must be at least 5 characters"),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  notes: z.string().optional(),
  isBulk: z.boolean().default(false),
  referralCode: z.string().optional(),
});

export default function Order() {
  const [_, setLocation] = useLocation();
  const [confirmedOrder, setConfirmedOrder] = useState<OrderType | null>(null);
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);

  const createOrder = useCreateOrder();
  const verifyOrderPayment = useVerifyOrderPayment();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      amount: 50,
      notes: "",
      isBulk: false,
      referralCode: "",
    },
  });

  useEffect(() => {
    // Check for referral code in URL
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get("ref");
    if (ref) {
      form.setValue("referralCode", ref);
      toast.success(`Referral code ${ref} applied!`);
    }
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    createOrder.mutate({ data: values }, {
      onSuccess: (order) => {
        // Open Paystack
        setIsPaystackOpen(true);
        const handler = (window as any).PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder', // fallback to avoid crash if env missing during design
          email: values.customerEmail,
          amount: Math.round(Number(values.amount) * 100), // GHS to pesewas
          currency: 'GHS',
          ref: `MCPB-${order.id}-${Date.now()}`,
          metadata: { orderId: order.id, customerName: values.customerName },
          onClose: () => {
            setIsPaystackOpen(false);
            toast.error(`Payment cancelled. Your order is saved (ID: ${order.id}). Re-submit when ready.`);
          },
          callback: (response: { reference: string }) => {
            setIsPaystackOpen(false);
            verifyOrderPayment.mutate({ data: { reference: response.reference } }, {
              onSuccess: (verifiedOrder) => {
                setConfirmedOrder(verifiedOrder);
                toast.success("Payment successful! Order confirmed.");
              },
              onError: () => {
                toast.error("Payment verification failed. Please contact support.");
              }
            });
          }
        });
        handler.openIframe();
      },
      onError: (error) => {
        toast.error("Failed to create order. Please try again.");
      }
    });
  }

  if (confirmedOrder) {
    return (
      <div className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full border-t-8 border-t-green-500 shadow-lg">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="font-serif text-3xl font-bold text-gray-900">Order Confirmed!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Thank you for choosing Mcphoebe Mushroom Bread.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-2xl font-bold text-gray-900">#{confirmedOrder.id}</p>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(confirmedOrder.id.toString());
                        toast.success("Order ID copied to clipboard");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <StatusBadge status={confirmedOrder.status} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-medium text-gray-900">{confirmedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                  <p className="font-medium text-gray-900">₵{confirmedOrder.amount.toFixed(2)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                  <p className="font-medium text-gray-900">{confirmedOrder.customerAddress}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
              <h4 className="font-bold text-gray-900 mb-2">Save your Order ID</h4>
              <p className="text-sm text-gray-600 mb-4">You will need this ID to track your delivery status.</p>
              <Button onClick={() => setLocation("/track")} variant="outline" className="bg-white">
                Track Order Now
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Button onClick={() => setConfirmedOrder(null)} variant="ghost">Place Another Order</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isLoading = createOrder.isPending || verifyOrderPayment.isPending || isPaystackOpen;

  return (
    <div className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">Order Mushroom Bread</h1>
          <p className="text-lg text-gray-600">Freshly baked in Kumasi and delivered to your doorstep.</p>
        </div>

        <Card className="shadow-md border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
            <CardDescription>Fill out the form below to place your order securely.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Kwame Mensah" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="kwame@example.com" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="024 123 4567" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Amount (GHC)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" step="0.01" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription>Minimum order is ₵50.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide detailed address for delivery within Kumasi..." 
                          className="resize-none" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="E.g., Please slice the bread, deliver after 2pm..." 
                          className="resize-none h-20" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <FormField
                    control={form.control}
                    name="isBulk"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-semibold text-gray-900">
                            Bulk Order Request
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Check this if you are ordering for an event or retail.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="hidden sm:block w-px bg-gray-200"></div>

                  <FormField
                    control={form.control}
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Referral Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter code if you have one" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6 border-t">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-bold" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        Pay ₵{form.watch("amount") || "0"} Securely
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                    Payments are securely processed via <span className="font-semibold text-gray-900">Paystack</span>
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}