import { pgTable, serial, timestamp, numeric, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const referralEarningsTable = pgTable("referral_earnings", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  orderId: integer("order_id").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReferralEarningSchema = createInsertSchema(referralEarningsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertReferralEarning = z.infer<typeof insertReferralEarningSchema>;
export type ReferralEarning = typeof referralEarningsTable.$inferSelect;
