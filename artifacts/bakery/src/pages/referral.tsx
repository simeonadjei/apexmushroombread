import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRegisterReferrer, Referrer } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Gift, Copy, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

export default function Referral() {
  const [referrer, setReferrer] = useState<Referrer | null>(null);
  const registerReferrer = useRegisterReferrer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    registerReferrer.mutate({ data: values }, {
      onSuccess: (data) => {
        setReferrer(data);
        toast.success("Successfully registered for the referral program!");
      },
      onError: () => {
        toast.error("Failed to register. You might already be registered with this email or phone.");
      }
    });
  }

  const copyToClipboard = () => {
    if (!referrer) return;
    const link = `${window.location.origin}/order?ref=${referrer.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied to clipboard!");
  };

  if (referrer) {
    return (
      <div className="flex-1 bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-t-8 border-t-primary shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Gift className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="font-serif text-3xl font-bold text-gray-900">Welcome, {referrer.name}!</CardTitle>
              <CardDescription className="text-lg mt-2">
                You are now an official Mcphoebe Referrer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Your Unique Referral Link</p>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <Input 
                    readOnly 
                    value={`${window.location.origin}/order?ref=${referrer.referralCode}`}
                    className="font-mono bg-transparent border-none shadow-none focus-visible:ring-0"
                  />
                  <Button onClick={copyToClipboard} size="icon" className="shrink-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Share this link. You'll earn <strong className="text-gray-900">15%</strong> of every order made through it.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Your Referral Code</p>
                  <p className="font-mono text-xl font-bold text-gray-900">{referrer.referralCode}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col justify-center">
                  <Link href="/referral/dashboard" className="text-primary font-semibold hover:underline flex items-center">
                    Go to Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(245,182,10,0.15),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl font-black mb-6">Become a Mcphoebe Partner</h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
            Earn a 15% commission on every order you refer. It's completely free to join and takes less than a minute.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Info side */}
          <div className="space-y-10">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <div className="w-16 h-1 bg-primary mb-8"></div>
              
              <div className="space-y-8">
                {[
                  { title: "Sign Up", desc: "Fill the form to get your unique referral code instantly." },
                  { title: "Share", desc: "Send your link to friends, family, or post it on social media." },
                  { title: "Earn", desc: "Get 15% of the total amount when someone orders using your code." },
                  { title: "Get Paid", desc: "Track your earnings in the dashboard and get paid directly." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Already a partner?</h3>
              <p className="text-sm text-gray-600 mb-4">Check your earnings and track your referrals.</p>
              <Link href="/referral/dashboard" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-white shadow-sm hover:bg-gray-50 h-10 px-6">
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Form side */}
          <div>
            <Card className="shadow-xl border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-2xl">Register Now</CardTitle>
                <CardDescription>Join the program and start earning today.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Kwame Mensah" {...field} disabled={registerReferrer.isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="kwame@example.com" {...field} disabled={registerReferrer.isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Mobile Money)</FormLabel>
                          <FormControl>
                            <Input placeholder="024 123 4567" {...field} disabled={registerReferrer.isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-bold" 
                      disabled={registerReferrer.isPending}
                    >
                      {registerReferrer.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Create My Account"
                      )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                      By registering, you agree to our Referral Program Terms.
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}