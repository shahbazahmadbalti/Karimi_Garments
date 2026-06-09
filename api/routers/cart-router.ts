import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";

export const cartRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const items = await db
      .select({
        cartItem: schema.cartItems,
        product: schema.products,
      })
      .from(schema.cartItems)
      .innerJoin(schema.products, eq(schema.cartItems.productId, schema.products.id))
      .where(eq(schema.cartItems.userId, ctx.user.id));

    return items.map((item) => ({
      ...item.cartItem,
      product: item.product,
    }));
  }),

  add: authedQuery
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
        size: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(schema.cartItems)
        .where(
          and(
            eq(schema.cartItems.userId, ctx.user.id),
            eq(schema.cartItems.productId, input.productId)
          )
        )
        .limit(1);

      if (existing[0]) {
        await db
          .update(schema.cartItems)
          .set({ quantity: existing[0].quantity + input.quantity })
          .where(eq(schema.cartItems.id, existing[0].id));
        return { success: true, action: "updated" };
      }

      await db.insert(schema.cartItems).values({
        userId: ctx.user.id,
        productId: input.productId,
        quantity: input.quantity,
        size: input.size,
        color: input.color,
      });

      return { success: true, action: "added" };
    }),

  updateQuantity: authedQuery
    .input(z.object({ id: z.number(), quantity: z.number().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(schema.cartItems)
        .set({ quantity: input.quantity })
        .where(and(eq(schema.cartItems.id, input.id), eq(schema.cartItems.userId, ctx.user.id)));
      return { success: true };
    }),

  remove: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(schema.cartItems)
        .where(and(eq(schema.cartItems.id, input.id), eq(schema.cartItems.userId, ctx.user.id)));
      return { success: true };
    }),

  clear: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db.delete(schema.cartItems).where(eq(schema.cartItems.userId, ctx.user.id));
    return { success: true };
  }),
});
