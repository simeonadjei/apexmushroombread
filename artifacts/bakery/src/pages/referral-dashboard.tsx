import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetReferrerByCode, useGetReferrerEarnings } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Wallet, Coins, ArrowRightLeft } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";

const searchSchema = z.object({
  code: z.string().min(1, "Please enter a referral code"),
});

export default function ReferralDashboard() {
  const [activeCode, setActiveCode] = useState<string | null>(null);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      code: "",
    },
  });

  function onSubmit(values: z.infer<typeof searchSchema>) {
    setActiveCode(values.code.trim());
  }

  // Fetch referrer details
  const { 
    data: referrer, 
    isLoading: isLoadingReferrer, 
    isError: isReferrerError 
  } = useGetReferrerByCode(activeCode || "", { 
    query: { 
      enabled: !!activeCode,
      queryKey: activeCode ? ["referrerByCode", activeCode] : ["none"]
    } 
  });

  // Fetch earnings if we have a referrer ID
  const {
    data: earnings,
    isLoading: isLoadingEarnings
  } = useGetReferrerEarnings(referrer?.id || 0, {
    query: {
      enabled: !!referrer?.id,
      queryKey: referrer?.id ? ["referrerEarnings", referrer.id] : ["none"]
    }
  });

  return (
    <div className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">Referral Dashboard</h1>
          <p className="text-lg text-gray-600">Track your earnings and referral history.</p>
        </div>

        {/* Search Section */}
        <Card className="border-t-4 border-t-black shadow-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="Enter your unique referral code (e.g. MCP-XYZ)..." 
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
                  Access Dashboard
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* States */}
        {isLoadingReferrer && (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your dashboard...</p>
          </div>
        )}

        {isReferrerError && activeCode && !isLoadingReferrer && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
            <p className="font-bold text-lg mb-1">Referral Code Not Found</p>
            <p>Please check the code and try again. It is case-sensitive.</p>
          </div>
        )}

        {/* Dashboard Content */}
        {referrer && !isLoadingReferrer && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black text-white border-none shadow-lg">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-white/10 rounded-full">
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Total Earnings</p>
                    <p className="text-3xl font-bold font-serif text-white">₵{referrer.totalEarnings.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-green-100 rounded-full">
                    <Coins className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Paid Earnings</p>
                    <p className="text-3xl font-bold font-serif text-gray-900">₵{referrer.paidEarnings.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-amber-100 rounded-full">
                    <ArrowRightLeft className="h-8 w-8 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Pending Payment</p>
                    <p className="text-3xl font-bold font-serif text-gray-900">
                      ₵{(referrer.totalEarnings - referrer.paidEarnings).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="font-medium">{referrer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium">{referrer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mobile Money Number</p>
                    <p className="font-medium">{referrer.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings History */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>A breakdown of your 15% commissions from referred orders.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingEarnings ? (
                  <div className="py-10 flex justify-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                ) : !earnings || earnings.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500 mb-2">No earnings yet.</p>
                    <p className="text-sm text-gray-400">Share your link to start earning!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead className="text-right">Payout Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {earnings.map((earning) => (
                        <TableRow key={earning.id}>
                          <TableCell className="font-medium">
                            {format(new Date(earning.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>#{earning.orderId}</TableCell>
                          <TableCell className="font-bold text-gray-900">₵{earning.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <StatusBadge status={earning.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}