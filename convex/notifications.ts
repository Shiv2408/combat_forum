import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect()
  },
})

export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      read: true,
    })
  },
})

export const markAllAsRead = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.and(q.eq(q.field("userId"), args.userId), q.eq(q.field("read"), false)))
      .collect()

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        read: true,
      })
    }
  },
})

