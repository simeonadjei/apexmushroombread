import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, referrersTable, referralEarningsTable } from "@workspace/db";
import {
  RegisterReferrerBody,
  RegisterReferrerResponse,
  GetReferrerByCodeParams,
  GetReferrerByCodeResponse,
  GetReferrerEarningsParams,
  GetReferrerEarningsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateReferralCode(): string {
  return "MCPB-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function formatReferrer(row: typeof referrersTable.$inferSelect) {
  return {
    ...row,
    totalEarnings: parseFloat(row.totalEarnings ?? "0"),
    paidEarnings: parseFloat(row.paidEarnings ?? "0"),
    createdAt: row.createdAt.toISOString(),
  };
}

// POST /referrers/register
router.post("/referrers/register", async (req, res): Promise<void> => {
  const parsed = RegisterReferrerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, phone } = parsed.data;

  const existing = await db
    .select()
    .from(referrersTable)
    .where(eq(referrersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered for the referral program." });
    return;
  }

  let referralCode = generateReferralCode();
  // Ensure uniqueness
  let attempts = 0;
  while (attempts < 5) {
    const codeCheck = await db
      .select()
      .from(referrersTable)
      .where(eq(referrersTable.referralCode, referralCode))
      .limit(1);
    if (codeCheck.length === 0) break;
    referralCode = generateReferralCode();
    attempts++;
  }

  const [referrer] = await db
    .insert(referrersTable)
    .values({ name, email, phone, referralCode })
    .returning();

  const response = RegisterReferrerResponse.parse(formatReferrer(referrer));
  res.status(201).json(response);
});

// GET /referrers/:referralCode
router.get("/referrers/:referralCode", async (req, res): Promise<void> => {
  const paramsParsed = GetReferrerByCodeParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.message });
    return;
  }

  const { referralCode } = paramsParsed.data;
  const [referrer] = await db
    .select()
    .from(referrersTable)
    .where(eq(referrersTable.referralCode, referralCode))
    .limit(1);

  if (!referrer) {
    res.status(404).json({ error: "Referral code not found." });
    return;
  }

  const response = GetReferrerByCodeResponse.parse(formatReferrer(referrer));
  res.json(response);
});

// GET /referrers/:referrerId/earnings
router.get("/referrers/:referrerId/earnings", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.referrerId)
    ? req.params.referrerId[0]
    : req.params.referrerId;
  const referrerId = parseInt(raw, 10);

  const paramsParsed = GetReferrerEarningsParams.safeParse({ referrerId });
  if (!paramsParsed.success || isNaN(referrerId)) {
    res.status(400).json({ error: "Invalid referrer ID." });
    return;
  }

  const earnings = await db
    .select()
    .from(referralEarningsTable)
    .where(eq(referralEarningsTable.referrerId, referrerId));

  const formatted = earnings.map((e) => ({
    ...e,
    amount: parseFloat(e.amount),
    createdAt: e.createdAt.toISOString(),
  }));

  const response = GetReferrerEarningsResponse.parse(formatted);
  res.json(response);
});

export default router;
