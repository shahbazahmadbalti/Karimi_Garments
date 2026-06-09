import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";

export const bannerRouter = createRouter({
  list: publicQuery
    .input(z.object({ position: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(schema.banners.isActive, true)];

      if (input?.position) {
        conditions.push(eq(schema.banners.position, input.position as any));
      }

      return db
        .select()
        .from(schema.banners)
        .where(and(...conditions))
        .orderBy(asc(schema.banners.sortOrder));
    }),

  listAll: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.banners).orderBy(asc(schema.banners.sortOrder));
  }),

  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1),
        subtitle: z.string().optional(),
        image: z.string().min(1),
        mobileImage: z.string().optional(),
        link: z.string().optional(),
        buttonText: z.string().optional(),
        position: z.enum(["hero", "promo", "banner"]).default("hero"),
        sortOrder: z.number().default(0),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(schema.banners).values({
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        endDate: input.endDate ? new Date(input.endDate) : null,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        image: z.string().optional(),
        mobileImage: z.string().optional(),
        link: z.string().optional(),
        buttonText: z.string().optional(),
        position: z.enum(["hero", "promo", "banner"]).optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.banners).set(data).where(eq(schema.banners.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.banners).where(eq(schema.banners.id, input.id));
      return { success: true };
    }),
});
