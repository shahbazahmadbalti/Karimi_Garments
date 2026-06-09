import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";

export const addressRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(schema.addresses)
      .where(eq(schema.addresses.userId, ctx.user.id))
      .orderBy(schema.addresses.isDefault);
  }),

  create: authedQuery
    .input(
      z.object({
        type: z.enum(["shipping", "billing"]).default("shipping"),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        company: z.string().optional(),
        address1: z.string().min(1),
        address2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().min(1),
        postalCode: z.string().min(1),
        country: z.string().default("Afghanistan"),
        phone: z.string().optional(),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (input.isDefault) {
        await db
          .update(schema.addresses)
          .set({ isDefault: false })
          .where(
            and(
              eq(schema.addresses.userId, ctx.user.id),
              eq(schema.addresses.type, input.type)
            )
          );
      }

      const result = await db.insert(schema.addresses).values({
        ...input,
        userId: ctx.user.id,
      });

      return { success: true, id: Number(result[0].insertId) };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        type: z.enum(["shipping", "billing"]).optional(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        company: z.string().optional(),
        address1: z.string().min(1).optional(),
        address2: z.string().optional(),
        city: z.string().min(1).optional(),
        state: z.string().min(1).optional(),
        postalCode: z.string().min(1).optional(),
        country: z.string().optional(),
        phone: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;

      if (data.isDefault && data.type) {
        await db
          .update(schema.addresses)
          .set({ isDefault: false })
          .where(
            and(
              eq(schema.addresses.userId, ctx.user.id),
              eq(schema.addresses.type, data.type)
            )
          );
      }

      await db
        .update(schema.addresses)
        .set(data)
        .where(and(eq(schema.addresses.id, id), eq(schema.addresses.userId, ctx.user.id)));

      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(schema.addresses)
        .where(and(eq(schema.addresses.id, input.id), eq(schema.addresses.userId, ctx.user.id)));
      return { success: true };
    }),
});
