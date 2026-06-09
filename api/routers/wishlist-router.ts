import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";

export const wishlistRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const items = await db
      .select({
        wishlistItem: schema.wishlistItems,
        product: schema.products,
      })
      .from(schema.wishlistItems)
      .innerJoin(schema.products, eq(schema.wishlistItems.productId, schema.products.id))
      .where(eq(schema.wishlistItems.userId, ctx.user.id));

    return items.map((item) => ({
      ...item.wishlistItem,
      product: item.product,
    }));
  }),

  add: authedQuery
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(schema.wishlistItems)
        .where(
          and(
            eq(schema.wishlistItems.userId, ctx.user.id),
            eq(schema.wishlistItems.productId, input.productId)
          )
        )
        .limit(1);

      if (existing[0]) {
        return { success: true, action: "already_exists" };
      }

      await db.insert(schema.wishlistItems).values({
        userId: ctx.user.id,
        productId: input.productId,
      });

      return { success: true, action: "added" };
    }),

  remove: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(schema.wishlistItems)
        .where(and(eq(schema.wishlistItems.id, input.id), eq(schema.wishlistItems.userId, ctx.user.id)));
      return { success: true };
    }),

  toggle: authedQuery
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(schema.wishlistItems)
        .where(
          and(
            eq(schema.wishlistItems.userId, ctx.user.id),
            eq(schema.wishlistItems.productId, input.productId)
          )
        )
        .limit(1);

      if (existing[0]) {
        await db.delete(schema.wishlistItems).where(eq(schema.wishlistItems.id, existing[0].id));
        return { success: true, isWishlisted: false };
      }

      await db.insert(schema.wishlistItems).values({
        userId: ctx.user.id,
        productId: input.productId,
      });

      return { success: true, isWishlisted: true };
    }),
});
