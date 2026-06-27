import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const existing = await ctx.db
      .query("userTokens")
      .filter((q) => q.eq(q.field("token"), token))
      .first();
    if (!existing) await ctx.db.insert("userTokens", { token });
  },
});

export const getTokens = query({
  handler: async (ctx) => {
    return await ctx.db.query("userTokens").collect();
  },
});

export const deleteToken = mutation({
  args: {
    id: v.id("userTokens"), // use v.id with your collection name
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id); // only pass the document ID
  },
});


