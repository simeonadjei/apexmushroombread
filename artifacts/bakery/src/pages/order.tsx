import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useCreateOrder } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowRight } from "lucide-react";

const formSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  customerAddress: z.string().min(5, "Address must be at least 5 characters"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  notes: z.string().optional(),
  isBulk: z.boolean().default(false),
  referralCode: z.string().optional(),
});

export default function Order() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const createOrder = useCreateOrder();

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
      onSuccess: async (order) => {
        setIsRedirecting(true);
        try {
          const callbackUrl = `${window.location.origin}/order/callback`;
          const res = await fetch(`/api/orders/${order.id}/pay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callbackUrl }),
          });
          const data = await res.json() as { authorization_url?: string; error?: string };
          if (!res.ok || !data.authorization_url) {
            toast.error(data.error || "Could not initialize payment. Please try again.");
            setIsRedirecting(false);
            return;
          }
          window.location.href = data.authorization_url;
        } catch {
          toast.error("Could not reach the payment server. Please try again.");
          setIsRedirecting(false);
        }
      },
      onError: () => {
        toast.error("Failed to create order. Please try again.");
      }
    });
  }

  const isLoading = createOrder.isPending || isRedirecting;

  return (
    <div className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">Order Apex Mushroom Bread</h1>
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
                          <Input type="number" min="0.01" step="0.01" {...field} disabled={isLoading} />
                        </FormControl>
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