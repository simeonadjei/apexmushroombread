import { useState } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export default function Donate() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!email || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid email and amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/donations/initialize`.replace(/\/+/g, "/").replace(":/", "://"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount: parsedAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to initialize donation.");
        return;
      }

      window.location.href = data.authorization_url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 bg-gray-50">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Support Apex Mushroom</h1>
          <p className="text-muted-foreground text-center text-sm">
            Your donation helps us continue baking healthy mushroom bread and supporting our community.
          </p>
        </div>

        <form onSubmit={handleDonate} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-foreground">
              Your Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className="text-sm font-semibold text-foreground">
              Donation Amount (GHS)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">₵</span>
              <input
                id="amount"
                type="number"
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter any amount"
                className="h-12 w-full rounded-xl border border-input bg-background pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {loading ? "Processing…" : "Donate with Paystack"}
          </button>
        </form>
      </div>
    </div>
  );
}
