import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const create = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    username: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first()

    if (existingUser) {
      return existingUser._id
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      username: args.username,
      imageUrl: args.imageUrl,
      following: [],
      followers: [],
    })
  },
})

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect()
  },
})

export const toggleFollow = mutation({
  args: {
    followerId: v.string(),
    followingId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the follower and following users
    const follower = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.followerId))
      .first()

    const following = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.followingId))
      .first()

    if (!follower || !following) {
      throw new Error("User not found")
    }

    // Check if already following
    const isFollowing = follower.following?.includes(args.followingId) || false

    if (isFollowing) {
      // Unfollow
      await ctx.db.patch(follower._id, {
        following: (follower.following || []).filter((id) => id !== args.followingId),
      })

      await ctx.db.patch(following._id, {
        followers: (following.followers || []).filter((id) => id !== args.followerId),
      })
    } else {
      // Follow
      await ctx.db.patch(follower._id, {
        following: [...(follower.following || []), args.followingId],
      })

      await ctx.db.patch(following._id, {
        followers: [...(following.followers || []), args.followerId],
      })

      // Create notification for the follow action
      await ctx.db.insert("notifications", {
        userId: args.followingId,
        type: "follow",
        actorId: args.followerId,
        content: `${follower.name} started following you`,
        read: false,
      })
    }

    return !isFollowing
  },
})


