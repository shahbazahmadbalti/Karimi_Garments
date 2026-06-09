import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";

export const reviewRouter = createRouter({
  listByProduct: publicQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(schema.reviews)
        .where(and(eq(schema.reviews.productId, input.productId), eq(schema.reviews.isApproved, true)))
        .orderBy(desc(schema.reviews.createdAt));
    }),

  create: authedQuery
    .input(
      z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const result = await db.insert(schema.reviews).values({
        productId: input.productId,
        userId: ctx.user.id,
        userName: ctx.user.name || "Anonymous",
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        isApproved: true,
      });

      const reviews = await db
        .select()
        .from(schema.reviews)
        .where(and(eq(schema.reviews.productId, input.productId), eq(schema.reviews.isApproved, true)));

      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await db
        .update(schema.products)
        .set({
          rating: avgRating.toFixed(1),
          reviewCount: reviews.length,
        })
        .where(eq(schema.products.id, input.productId));

      return { success: true, id: Number(result[0].insertId) };
    }),

  listPending: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(schema.reviews)
      .where(eq(schema.reviews.isApproved, false))
      .orderBy(desc(schema.reviews.createdAt));
  }),

  approve: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.reviews)
        .set({ isApproved: true })
        .where(eq(schema.reviews.id, input.id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.reviews).where(eq(schema.reviews.id, input.id));
      return { success: true };
    }),
});
