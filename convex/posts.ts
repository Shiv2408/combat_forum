import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const create = mutation({
  args: {
    authorId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("posts", {
      authorId: args.authorId,
      content: args.content,
      likes: [],
    })
  },
})

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").collect()
  },
})

