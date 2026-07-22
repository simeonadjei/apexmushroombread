import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, ordersTable, referrersTable, referralEarningsTable } from "@workspace/db";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// GET /stats
router.get("/stats", async (req, res): Promise<void> => {
  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      totalAmount: sql<string>`coalesce(sum(amount), 0)`,
    })
    .from(ordersTable)
    .where(sql`status = 'paid'`);

  const [referrerStats] = await db
    .select({
      totalReferrers: sql<number>`count(*)::int`,
    })
    .from(referrersTable);

  const [earningStats] = await db
    .select({
      totalEarningsDistributed: sql<string>`coalesce(sum(amount), 0)`,
    })
    .from(referralEarningsTable);

  const response = GetStatsResponse.parse({
    totalOrders: orderStats.totalOrders ?? 0,
    totalAmount: parseFloat(String(orderStats.totalAmount ?? "0")),
    totalReferrers: referrerStats.totalReferrers ?? 0,
    totalEarningsDistributed: parseFloat(String(earningStats.totalEarningsDistributed ?? "0")),
  });

  res.json(response);
});

export default router;
