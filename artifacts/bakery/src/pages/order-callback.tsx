import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useVerifyOrderPayment, Order as OrderType } from "@workspace/api-client-react";
import { CheckCircle2, XCircle, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

export default function OrderCallback() {
  const [, setLocation] = useLocation();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const verifyOrderPayment = useVerifyOrderPayment();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");

    if (!reference) {
      setError("No payment reference found. Please contact support.");
      return;
    }

    verifyOrderPayment.mutate(
      { data: { reference } },
      {
        onSuccess: (verified) => setOrder(verified),
        onError: () => setError("Payment verification failed. Please contact support with your reference: " + reference),
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (verifyOrderPayment.isPending) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg font-medium text-gray-700">Confirming your payment…</p>
          <p className="text-sm text-muted-foreground">Please wait, do not close this page.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 px-4">
        <Card className="max-w-md w-full border-t-8 border-t-red-500 shadow-lg text-center">
          <CardHeader>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="font-serif text-2xl">Payment Issue</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-3">
            <Button onClick={() => setLocation("/order")} variant="outline">Try Again</Button>
            <Button onClick={() => setLocation("/track")}>Track Order</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (order) {
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
                    <p className="font-mono text-2xl font-bold text-gray-900">#{order.id}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(order.id.toString());
                        toast.success("Order ID copied!");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                  <p className="font-medium text-gray-900">₵{order.amount.toFixed(2)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                  <p className="font-medium text-gray-900">{order.customerAddress}</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
              <h4 className="font-bold text-gray-900 mb-2">Save your Order ID</h4>
              <p className="text-sm text-gray-600 mb-4">Use this ID to track your delivery status.</p>
              <Button onClick={() => setLocation("/track")} variant="outline" className="bg-white">
                Track Order Now
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Button onClick={() => setLocation("/order")} variant="ghost">Place Another Order</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
}
