import { Router } from "express";

const router = Router();

router.post("/donations/initialize", async (req, res) => {
  const { email, amount } = req.body as { email?: unknown; amount?: unknown };

  if (
    typeof email !== "string" ||
    !email.includes("@") ||
    typeof amount !== "number" ||
    amount <= 0
  ) {
    res.status(400).json({ error: "Invalid email or amount." });
    return;
  }
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    res.status(500).json({ error: "Payment not configured." });
    return;
  }

  const amountInKobo = Math.round(amount * 100);

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        currency: "GHS",
        metadata: { type: "donation" },
      }),
    });

    const data = (await response.json()) as {
      status: boolean;
      data?: { authorization_url: string };
      message?: string;
    };

    if (!data.status || !data.data) {
      req.log.error({ msg: "Paystack error", detail: data.message });
      res.status(502).json({ error: data.message || "Paystack error." });
      return;
    }

    res.json({ authorization_url: data.data.authorization_url });
  } catch (err) {
    req.log.error({ err, msg: "Paystack request failed" });
    res.status(502).json({ error: "Failed to reach Paystack." });
  }
});

export default router;
