import { z } from "zod";
import { eq, and, like, desc, asc, sql, gte, lte } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sort: z.enum(["newest", "price_asc", "price_desc", "name_asc", "popular"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        isFeatured: z.boolean().optional(),
        isNewArrival: z.boolean().optional(),
        isBestSeller: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }).default({ limit: 20, offset: 0 })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input;
      const conditions = [];

      if (params.categoryId) {
        conditions.push(eq(schema.products.categoryId, params.categoryId));
      }
      if (params.search) {
        conditions.push(like(schema.products.name, `%${params.search}%`));
      }
      if (params.minPrice !== undefined) {
        conditions.push(gte(schema.products.price, params.minPrice.toString()));
      }
      if (params.maxPrice !== undefined) {
        conditions.push(lte(schema.products.price, params.maxPrice.toString()));
      }
      if (params.isFeatured !== undefined) {
        conditions.push(eq(schema.products.isFeatured, params.isFeatured));
      }
      if (params.isNewArrival !== undefined) {
        conditions.push(eq(schema.products.isNewArrival, params.isNewArrival));
      }
      if (params.isBestSeller !== undefined) {
        conditions.push(eq(schema.products.isBestSeller, params.isBestSeller));
      }
      if (params.isActive !== undefined) {
        conditions.push(eq(schema.products.isActive, params.isActive));
      } else {
        conditions.push(eq(schema.products.isActive, true));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      let orderBy;
      switch (params.sort) {
        case "price_asc":
          orderBy = asc(schema.products.price);
          break;
        case "price_desc":
          orderBy = desc(schema.products.price);
          break;
        case "name_asc":
          orderBy = asc(schema.products.name);
          break;
        case "popular":
          orderBy = desc(schema.products.reviewCount);
          break;
        default:
          orderBy = desc(schema.products.createdAt);
      }

      const limit = params.limit ?? 20;
      const offset = params.offset ?? 0;

      const items = await db
        .select()
        .from(schema.products)
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.products)
        .where(where);

      return {
        items,
        total: countResult[0]?.count || 0,
        limit,
        offset,
      };
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.products)
        .where(and(eq(schema.products.slug, input.slug), eq(schema.products.isActive, true)))
        .limit(1);
      return rows[0] || null;
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, input.id))
        .limit(1);
      return rows[0] || null;
    }),

  related: publicQuery
    .input(z.object({ productId: z.number(), categoryId: z.number(), limit: z.number().default(4) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(schema.products)
        .where(
          and(
            eq(schema.products.categoryId, input.categoryId),
            eq(schema.products.isActive, true)
          )
        )
        .limit(input.limit);
    }),

  // Admin endpoints
  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        sku: z.string().min(1),
        categoryId: z.number(),
        price: z.string().or(z.number()),
        compareAtPrice: z.string().or(z.number()).optional(),
        costPrice: z.string().or(z.number()).optional(),
        stockQuantity: z.number().default(0),
        lowStockThreshold: z.number().default(5),
        weight: z.string().or(z.number()).optional(),
        material: z.string().optional(),
        careInstructions: z.string().optional(),
        sizes: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        featuredImage: z.string().optional(),
        images: z.array(z.string()).optional(),
        isFeatured: z.boolean().default(false),
        isNewArrival: z.boolean().default(false),
        isBestSeller: z.boolean().default(false),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(schema.products).values(input as any);
      return result;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        sku: z.string().min(1).optional(),
        categoryId: z.number().optional(),
        price: z.string().or(z.number()).optional(),
        compareAtPrice: z.string().or(z.number()).optional(),
        costPrice: z.string().or(z.number()).optional(),
        stockQuantity: z.number().optional(),
        lowStockThreshold: z.number().optional(),
        weight: z.string().or(z.number()).optional(),
        material: z.string().optional(),
        careInstructions: z.string().optional(),
        sizes: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        featuredImage: z.string().optional(),
        images: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        isNewArrival: z.boolean().optional(),
        isBestSeller: z.boolean().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.products).set(data as any).where(eq(schema.products.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.products).where(eq(schema.products.id, input.id));
      return { success: true };
    }),

  updateStock: adminQuery
    .input(z.object({ id: z.number(), quantity: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.products)
        .set({ stockQuantity: input.quantity })
        .where(eq(schema.products.id, input.id));
      return { success: true };
    }),
});
