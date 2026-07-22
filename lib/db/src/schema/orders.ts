import { pgTable, text, serial, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  isBulk: boolean("is_bulk").notNull().default(false),
  referralCode: text("referral_code"),
  referrerId: integer("referrer_id"),
  paystackRef: text("paystack_ref"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  paystackRef: true,
  status: true,
  createdAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
