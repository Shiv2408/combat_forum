import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    username: v.string(),
    imageUrl: v.string(),
    following: v.optional(v.array(v.string())),
    followers: v.optional(v.array(v.string())),
  }).index("by_clerk_id", ["clerkId"]),

  posts: defineTable({
    authorId: v.string(),
    content: v.string(),
    likes: v.optional(v.array(v.string())),
  }).index("by_author", ["authorId"]),

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.string(),
    content: v.string(),
    parentId: v.optional(v.id("comments")), // For replies - null for top-level comments
    likes: v.optional(v.array(v.string())),
    replyCount: v.optional(v.number()), // To track number of replies
  })
    .index("by_post", ["postId"])
    .index("by_parent", ["parentId"]),

  notifications: defineTable({
    userId: v.string(),
    type: v.string(), // 'like', 'follow', 'comment', 'reply', 'comment_like'
    actorId: v.string(), // who performed the action
    targetId: v.optional(v.string()), // post id for likes and comments, comment id for replies and comment likes
    content: v.string(),
    read: v.boolean(),
  }).index("by_user", ["userId"]),
})

