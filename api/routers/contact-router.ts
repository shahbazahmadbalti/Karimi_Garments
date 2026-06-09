import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";

export const contactRouter = createRouter({
  submit: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        subject: z.string().min(1),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(schema.inquiries).values(input);
      return { success: true };
    }),

  subscribe: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(schema.subscribers)
        .where(eq(schema.subscribers.email, input.email))
        .limit(1);

      if (existing[0]) {
        return { success: true, message: "Already subscribed" };
      }

      await db.insert(schema.subscribers).values({ email: input.email });
      return { success: true, message: "Subscribed successfully" };
    }),

  listInquiries: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(schema.inquiries)
      .orderBy(desc(schema.inquiries.createdAt));
  }),

  updateInquiryStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "read", "replied", "archived"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.inquiries)
        .set({ status: input.status })
        .where(eq(schema.inquiries.id, input.id));
      return { success: true };
    }),

  listSubscribers: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt));
  }),
});
