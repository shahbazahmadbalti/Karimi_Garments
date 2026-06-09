import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";

export const adminRouter = createRouter({
  dashboard: adminQuery.query(async () => {
    const db = getDb();

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      allProducts,
      recentOrders,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(schema.users),
      db.select({ count: sql<number>`count(*)` }).from(schema.products),
      db.select({ count: sql<number>`count(*)` }).from(schema.orders),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.orders)
        .where(eq(schema.orders.status, "pending")),
      db
        .select({ total: sql<string>`COALESCE(SUM(total), 0)` })
        .from(schema.orders)
        .where(eq(schema.orders.paymentStatus, "paid")),
      db.select().from(schema.products).where(eq(schema.products.isActive, true)),
      db
        .select()
        .from(schema.orders)
        .orderBy(desc(schema.orders.createdAt))
        .limit(10),
    ]);

    const lowStockProducts = allProducts.filter(
      (p) => p.stockQuantity <= p.lowStockThreshold
    );

    const topProducts = await db
      .select({
        productId: schema.orderItems.productId,
        productName: schema.orderItems.productName,
        totalSold: sql<number>`SUM(${schema.orderItems.quantity})`,
        revenue: sql<string>`SUM(${schema.orderItems.price} * ${schema.orderItems.quantity})`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .groupBy(schema.orderItems.productId)
      .orderBy(desc(sql`SUM(${schema.orderItems.quantity})`))
      .limit(5);

    return {
      stats: {
        totalUsers: totalUsers[0]?.count || 0,
        totalProducts: totalProducts[0]?.count || 0,
        totalOrders: totalOrders[0]?.count || 0,
        pendingOrders: pendingOrders[0]?.count || 0,
        totalRevenue: totalRevenue[0]?.total || "0",
        lowStockCount: lowStockProducts.length,
      },
      recentOrders,
      topProducts,
      lowStockProducts: lowStockProducts.slice(0, 10),
    };
  }),

  users: adminQuery
    .input(
      z.object({
        role: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).default({ limit: 50, offset: 0 })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input;
      const conditions = [];

      if (params.role) {
        conditions.push(eq(schema.users.role, params.role as any));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const limit = params.limit ?? 50;
      const offset = params.offset ?? 0;

      const items = await db
        .select()
        .from(schema.users)
        .where(where)
        .orderBy(desc(schema.users.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.users)
        .where(where);

      return { items, total: countResult[0]?.count || 0 };
    }),

  updateUserRole: adminQuery
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["customer", "staff", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.users)
        .set({ role: input.role })
        .where(eq(schema.users.id, input.id));
      return { success: true };
    }),

  toggleUserStatus: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, input.id))
        .limit(1);

      if (user[0]) {
        await db
          .update(schema.users)
          .set({ isActive: !user[0].isActive })
          .where(eq(schema.users.id, input.id));
      }

      return { success: true };
    }),

  salesReport: adminQuery
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      const orders = await db
        .select()
        .from(schema.orders)
        .where(
          and(
            sql`${schema.orders.createdAt} >= ${start}`,
            sql`${schema.orders.createdAt} <= ${end}`
          )
        )
        .orderBy(desc(schema.orders.createdAt));

      const summary = await db
        .select({
          totalRevenue: sql<string>`COALESCE(SUM(total), 0)`,
          totalOrders: sql<number>`count(*)`,
          avgOrderValue: sql<string>`COALESCE(AVG(total), 0)`,
        })
        .from(schema.orders)
        .where(
          and(
            sql`${schema.orders.createdAt} >= ${start}`,
            sql`${schema.orders.createdAt} <= ${end}`
          )
        );

      return { orders, summary: summary[0] };
    }),
});
