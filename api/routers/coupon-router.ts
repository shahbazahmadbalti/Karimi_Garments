import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";

export const couponRouter = createRouter({
  validate: publicQuery
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const now = new Date();

      const rows = await db
        .select()
        .from(schema.coupons)
        .where(
          and(
            eq(schema.coupons.code, input.code.toUpperCase()),
            eq(schema.coupons.isActive, true)
          )
        )
        .limit(1);

      const coupon = rows[0];

      if (!coupon) {
        return { valid: false, message: "Invalid coupon code" };
      }

      if (coupon.endDate && new Date(coupon.endDate) < now) {
        return { valid: false, message: "Coupon has expired" };
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { valid: false, message: "Coupon usage limit reached" };
      }

      return {
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount,
          maxDiscount: coupon.maxDiscount,
        },
      };
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.coupons).orderBy(schema.coupons.createdAt);
  }),

  create: adminQuery
    .input(
      z.object({
        code: z.string().min(1),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number().positive(),
        minOrderAmount: z.number().default(0),
        maxDiscount: z.number().optional(),
        usageLimit: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(schema.coupons).values({
        code: input.code.toUpperCase(),
        description: input.description,
        discountType: input.discountType,
        discountValue: input.discountValue.toString(),
        minOrderAmount: input.minOrderAmount.toString(),
        maxDiscount: input.maxDiscount ? input.maxDiscount.toString() : null,
        usageLimit: input.usageLimit ?? null,
        usageCount: 0,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        endDate: input.endDate ? new Date(input.endDate) : null,
        isActive: input.isActive,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        code: z.string().optional(),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]).optional(),
        discountValue: z.number().positive().optional(),
        minOrderAmount: z.number().optional(),
        maxDiscount: z.number().optional(),
        usageLimit: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...rawData } = input;
      const data: any = { ...rawData };
      if (rawData.discountValue !== undefined) data.discountValue = rawData.discountValue.toString();
      if (rawData.minOrderAmount !== undefined) data.minOrderAmount = rawData.minOrderAmount.toString();
      if (rawData.maxDiscount !== undefined) data.maxDiscount = rawData.maxDiscount ? rawData.maxDiscount.toString() : null;
      if (rawData.code !== undefined) data.code = rawData.code.toUpperCase();

      await db.update(schema.coupons).set(data).where(eq(schema.coupons.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.coupons).where(eq(schema.coupons.id, input.id));
      return { success: true };
    }),
});
