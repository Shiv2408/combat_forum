import { mutation } from "./_generated/server"
import { v } from "convex/values"

export const create = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the post
    const post = await ctx.db.get(args.postId)

    if (!post) {
      throw new Error("Post not found")
    }

    // Check if already liked
    const alreadyLiked = post.likes?.includes(args.userId) || false

    if (alreadyLiked) {
      // Unlike
      await ctx.db.patch(args.postId, {
        likes: (post.likes || []).filter((id: string) => id !== args.userId),
      })
      return false
    } else {
      // Like
      await ctx.db.patch(args.postId, {
        likes: [...(post.likes || []), args.userId],
      })

      // Create notification if the post is not by the current user
      if (post.authorId !== args.userId) {
        // Get the user who liked
        const liker = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), args.userId))
          .first()

        if (liker) {
          // Create a notification for the post author
          await ctx.db.insert("notifications", {
            userId: post.authorId,
            type: "like",
            actorId: args.userId,
            targetId: args.postId.toString(),
            content: `${liker.name} liked your post`,
            read: false,
          })
        }
      }

      return true
    }
  },
})

