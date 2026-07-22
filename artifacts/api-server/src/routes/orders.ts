import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, ordersTable, referrersTable, referralEarningsTable } from "@workspace/db";
import {
  CreateOrderBody,
  CreateOrderResponse,
  GetOrderParams,
  GetOrderResponse,
  VerifyOrderPaymentBody,
  VerifyOrderPaymentResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const REFERRAL_COMMISSION_RATE = 0.15;

function formatOrder(row: typeof ordersTable.$inferSelect) {
  return {
    id: row.id,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    customerAddress: row.customerAddress,
    amount: parseFloat(row.amount),
    notes: row.notes ?? null,
    isBulk: row.isBulk,
    referralCode: row.referralCode ?? null,
    paystackRef: row.paystackRef ?? null,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

// POST /orders
router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { customerName, customerEmail, customerPhone, customerAddress, amount, notes, isBulk, referralCode } =
    parsed.data;

  // Validate referral code if provided
  let referrerId: number | undefined;
  if (referralCode) {
    const [referrer] = await db
      .select()
      .from(referrersTable)
      .where(eq(referrersTable.referralCode, referralCode))
      .limit(1);
    if (referrer) {
      referrerId = referrer.id;
    }
  }

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      amount: String(amount),
      notes: notes ?? null,
      isBulk: isBulk ?? false,
      referralCode: referralCode ?? null,
      referrerId: referrerId ?? null,
      status: "pending",
    })
    .returning();

  const response = CreateOrderResponse.parse(formatOrder(order));
  res.status(201).json(response);
});

// GET /orders/:id
router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const paramsParsed = GetOrderParams.safeParse({ id });
  if (!paramsParsed.success || isNaN(id)) {
    res.status(400).json({ error: "Invalid order ID." });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id))
    .limit(1);

  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }

  const response = GetOrderResponse.parse(formatOrder(order));
  res.json(response);
});

// POST /orders/:id/pay — initialize Paystack transaction server-side
router.post("/orders/:id/pay", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid order ID." });
    return;
  }

  const { callbackUrl } = req.body as { callbackUrl?: unknown };
  if (typeof callbackUrl !== "string" || !callbackUrl.startsWith("http")) {
    res.status(400).json({ error: "A valid callbackUrl is required." });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id))
    .limit(1);

  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Payment not configured." });
    return;
  }

  const amountInKobo = Math.round(parseFloat(order.amount) * 100);

  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: order.customerEmail,
      amount: amountInKobo,
      currency: "GHS",
      callback_url: callbackUrl,
      metadata: { orderId: order.id, customerName: order.customerName },
    }),
  });

  const data = (await paystackRes.json()) as {
    status: boolean;
    data?: { authorization_url: string; reference: string };
    message?: string;
  };

  if (!data.status || !data.data) {
    req.log.error({ msg: "Paystack init error", detail: data.message });
    res.status(502).json({ error: data.message || "Could not initialize payment." });
    return;
  }

  res.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
});

// POST /orders/verify
router.post("/orders/verify", async (req, res): Promise<void> => {
  const parsed = VerifyOrderPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { reference } = parsed.data;

  // Verify payment with Paystack
  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const paystackData = (await paystackRes.json()) as {
    status: boolean;
    data?: { status: string; amount: number; metadata?: { orderId?: number } };
    message?: string;
  };

  if (!paystackData.status || paystackData.data?.status !== "success") {
    req.log.warn({ reference, paystackData }, "Payment verification failed");
    res.status(400).json({ error: "Payment verification failed. Please contact support." });
    return;
  }

  const orderId = paystackData.data?.metadata?.orderId;
  if (!orderId) {
    res.status(400).json({ error: "Order ID missing from payment metadata." });
    return;
  }

  // Find the pending order
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }

  if (order.status === "paid") {
    // Already verified — return the order
    const response = VerifyOrderPaymentResponse.parse(formatOrder(order));
    res.json(response);
    return;
  }

  // Mark order as paid
  const [updatedOrder] = await db
    .update(ordersTable)
    .set({ status: "paid", paystackRef: reference })
    .where(eq(ordersTable.id, orderId))
    .returning();

  // Handle referral commission
  if (updatedOrder.referrerId && updatedOrder.referralCode) {
    try {
      const commission = parseFloat(updatedOrder.amount) * REFERRAL_COMMISSION_RATE;
      const commissionStr = commission.toFixed(2);

      await db.insert(referralEarningsTable).values({
        referrerId: updatedOrder.referrerId,
        orderId: updatedOrder.id,
        amount: commissionStr,
        status: "pending",
      });

      await db
        .update(referrersTable)
        .set({
          totalEarnings: sql`total_earnings + ${commissionStr}`,
        })
        .where(eq(referrersTable.id, updatedOrder.referrerId));

      req.log.info(
        { referrerId: updatedOrder.referrerId, commission: commissionStr },
        "Referral commission credited",
      );
    } catch (err) {
      req.log.error({ err }, "Failed to credit referral commission");
      // Don't fail the main response
    }
  }

  const response = VerifyOrderPaymentResponse.parse(formatOrder(updatedOrder));
  res.json(response);
});

export default router;
