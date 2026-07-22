import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const referrersTable = pgTable("referrers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  referralCode: text("referral_code").notNull().unique(),
  totalEarnings: numeric("total_earnings", { precision: 10, scale: 2 }).notNull().default("0"),
  paidEarnings: numeric("paid_earnings", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReferrerSchema = createInsertSchema(referrersTable).omit({
  id: true,
  totalEarnings: true,
  paidEarnings: true,
  createdAt: true,
});
export type InsertReferrer = z.infer<typeof insertReferrerSchema>;
export type Referrer = typeof referrersTable.$inferSelect;
