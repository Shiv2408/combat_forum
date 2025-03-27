import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const create = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.string(),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    // Get the post to check if it exists and to get the post author
    const post = await ctx.db.get(args.postId)

    if (!post) {
      throw new Error("Post not found")
    }

    // If this is a reply, check if parent comment exists and update its reply count
    if (args.parentId) {
      const parentComment = await ctx.db.get(args.parentId)

      if (!parentComment) {
        throw new Error("Parent comment not found")
      }

      // Increment the reply count on the parent comment
      await ctx.db.patch(args.parentId, {
        replyCount: (parentComment.replyCount || 0) + 1,
      })
    }

    // Create the comment
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: args.authorId,
      content: args.content,
      parentId: args.parentId,
      likes: [],
      replyCount: 0,
    })

    // Create a notification
    // If it's a reply, notify the parent comment author
    // If it's a top-level comment, notify the post author
    if (args.parentId) {
      const parentComment = await ctx.db.get(args.parentId)

      if (parentComment && parentComment.authorId !== args.authorId) {
        // Get the commenter's info
        const commenter = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), args.authorId))
          .first()

        if (commenter) {
          await ctx.db.insert("notifications", {
            userId: parentComment.authorId,
            type: "reply",
            actorId: args.authorId,
            targetId: args.parentId.toString(),
            content: `${commenter.name} replied to your comment`,
            read: false,
          })
        }
      }
    } else if (post.authorId !== args.authorId) {
      // Get the commenter's info
      const commenter = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), args.authorId))
        .first()

      if (commenter) {
        await ctx.db.insert("notifications", {
          userId: post.authorId,
          type: "comment",
          actorId: args.authorId,
          targetId: args.postId.toString(),
          content: `${commenter.name} commented on your post`,
          read: false,
        })
      }
    }

    return commentId
  },
})

export const listByPost = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // Get all comments for this post (both top-level and replies)
    return await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .order("asc")
      .collect()
  },
})

export const listReplies = query({
  args: {
    parentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("parentId"), args.parentId))
      .order("asc")
      .collect()
  },
})

export const toggleLike = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the comment
    const comment = await ctx.db.get(args.commentId)

    if (!comment) {
      throw new Error("Comment not found")
    }

    // Check if already liked
    const alreadyLiked = comment.likes?.includes(args.userId) || false

    if (alreadyLiked) {
      // Unlike
      await ctx.db.patch(args.commentId, {
        likes: (comment.likes || []).filter((id: string) => id !== args.userId),
      })
      return false
    } else {
      // Like
      await ctx.db.patch(args.commentId, {
        likes: [...(comment.likes || []), args.userId],
      })

      // Create notification if the comment is not by the current user
      if (comment.authorId !== args.userId) {
        // Get the user who liked
        const liker = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), args.userId))
          .first()

        if (liker) {
          await ctx.db.insert("notifications", {
            userId: comment.authorId,
            type: "comment_like",
            actorId: args.userId,
            targetId: args.commentId.toString(),
            content: `${liker.name} liked your comment`,
            read: false,
          })
        }
      }

      return true
    }
  },
})

