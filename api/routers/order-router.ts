import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery, staffQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";

function generateOrderNumber() {
  const prefix = "KG";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const orderRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const orders = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.userId, ctx.user.id))
      .orderBy(desc(schema.orders.createdAt));

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(schema.orderItems)
          .where(eq(schema.orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return ordersWithItems;
  }),

  byId: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.orders)
        .where(and(eq(schema.orders.id, input.id), eq(schema.orders.userId, ctx.user.id)))
        .limit(1);

      if (!rows[0]) return null;

      const items = await db
        .select()
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, input.id));

      return { ...rows[0], items };
    }),

  create: authedQuery
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            productName: z.string(),
            productImage: z.string().optional(),
            price: z.number(),
            quantity: z.number().min(1),
            size: z.string().optional(),
            color: z.string().optional(),
          })
        ),
        subtotal: z.number(),
        shippingCost: z.number().default(0),
        tax: z.number().default(0),
        discount: z.number().default(0),
        total: z.number(),
        shippingAddressId: z.number().optional(),
        billingAddressId: z.number().optional(),
        paymentMethod: z.enum(["stripe", "paypal", "cod"]).default("cod"),
        couponCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const orderNumber = generateOrderNumber();

      const result = await db.insert(schema.orders).values({
        orderNumber,
        userId: ctx.user.id,
        status: "pending",
        paymentStatus: input.paymentMethod === "cod" ? "pending" : "pending",
        paymentMethod: input.paymentMethod,
        subtotal: input.subtotal.toString(),
        shippingCost: input.shippingCost.toString(),
        tax: input.tax.toString(),
        discount: input.discount.toString(),
        total: input.total.toString(),
        shippingAddressId: input.shippingAddressId,
        billingAddressId: input.billingAddressId,
        couponCode: input.couponCode,
        notes: input.notes,
      });

      const orderId = Number(result[0].insertId);

      for (const item of input.items) {
        await db.insert(schema.orderItems).values({
          orderId,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          price: item.price.toString(),
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        });

        const product = await db
          .select()
          .from(schema.products)
          .where(eq(schema.products.id, item.productId))
          .limit(1);

        if (product[0]) {
          await db
            .update(schema.products)
            .set({ stockQuantity: Math.max(0, product[0].stockQuantity - item.quantity) })
            .where(eq(schema.products.id, item.productId));
        }
      }

      return { success: true, orderId, orderNumber };
    }),

  listAll: staffQuery
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).default({ limit: 50, offset: 0 })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input;
      const conditions = [];

      if (params.status) {
        conditions.push(eq(schema.orders.status, params.status as any));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const limit = params.limit ?? 50;
      const offset = params.offset ?? 0;

      const orders = await db
        .select()
        .from(schema.orders)
        .where(where)
        .orderBy(desc(schema.orders.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.orders)
        .where(where);

      return {
        items: orders,
        total: countResult[0]?.count || 0,
      };
    }),

  updateStatus: staffQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ]),
        trackingNumber: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: any = { status: input.status };
      if (input.trackingNumber) updateData.trackingNumber = input.trackingNumber;

      await db.update(schema.orders).set(updateData).where(eq(schema.orders.id, input.id));
      return { success: true };
    }),

  stats: staffQuery.query(async () => {
    const db = getDb();

    const [totalOrders, pendingOrders, totalRevenue] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(schema.orders),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.orders)
        .where(eq(schema.orders.status, "pending")),
      db
        .select({ total: sql<string>`COALESCE(SUM(total), 0)` })
        .from(schema.orders)
        .where(eq(schema.orders.paymentStatus, "paid")),
    ]);

    return {
      totalOrders: totalOrders[0]?.count || 0,
      pendingOrders: pendingOrders[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.total || "0",
    };
  }),
});
