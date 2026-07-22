import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetOrder } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Search, Loader2, Package, MapPin, Phone, User, Calendar, Receipt } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";

const searchSchema = z.object({
  id: z.coerce.number().min(1, "Please enter a valid Order ID"),
});

export default function TrackOrder() {
  const [activeId, setActiveId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      id: "" as any,
    },
  });

  function onSubmit(values: z.infer<typeof searchSchema>) {
    setActiveId(values.id);
  }

  const { 
    data: order, 
    isLoading, 
    isError 
  } = useGetOrder(activeId || 0, { 
    query: { 
      enabled: !!activeId,
      queryKey: activeId ? ["order", activeId] : ["none"]
    } 
  });

  return (
    <div className="flex-1 bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-lg text-gray-600">Enter your Order ID to check its current status.</p>
        </div>

        {/* Search Section */}
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input 
                            type="number"
                            placeholder="Enter Order ID (e.g. 42)" 
                            className="pl-10 h-14 text-lg" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="h-14 px-8 text-lg font-bold w-full sm:w-auto">
                  Track Order
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* States */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Locating your order...</p>
          </div>
        )}

        {isError && activeId && !isLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
            <p className="font-bold text-lg mb-1">Order Not Found</p>
            <p>We couldn't find an order with ID #{activeId}. Please check the number and try again.</p>
          </div>
        )}

        {/* Order Details */}
        {order && !isLoading && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden shadow-lg border-none">
            <div className="bg-black text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Order Details</p>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-3xl font-bold">#{order.id}</h2>
                  <StatusBadge status={order.status} className="bg-white/10 border-white/20 text-white" />
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-primary">₵{order.amount.toFixed(2)}</p>
              </div>
            </div>
            
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Customer Details */}
                <div className="p-6 sm:p-8 space-y-6">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                    <User className="h-5 w-5 text-primary" /> Delivery Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 mb-0.5">Customer Name</p>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 mb-0.5">Phone Number</p>
                        <p className="font-medium text-gray-900">{order.customerPhone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 mb-0.5">Delivery Address</p>
                        <p className="font-medium text-gray-900 leading-relaxed">{order.customerAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Meta */}
                <div className="p-6 sm:p-8 space-y-6 bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                    <Package className="h-5 w-5 text-primary" /> Order Summary
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 mb-0.5">Order Date</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Receipt className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 mb-0.5">Payment Reference</p>
                        <p className="font-mono text-sm text-gray-900 break-all">{order.paystackRef || 'N/A'}</p>
                      </div>
                    </div>

                    {order.isBulk && (
                      <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-semibold">
                        <Package className="h-4 w-4" />
                        Bulk Order
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {order.notes && (
                <div className="p-6 sm:p-8 bg-amber-50/50 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Special Instructions</p>
                  <p className="text-gray-900 italic">"{order.notes}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}