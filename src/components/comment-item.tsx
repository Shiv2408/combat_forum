"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import type { Id } from "../../convex/_generated/dataModel"
import { CommentLikeButton } from "./comment-like-button"
import { ReplyForm } from "./reply-form"

interface CommentItemProps {
  comment: any
  postId: Id<"posts">
  users: any[]
  level?: number
}

export function CommentItem({ comment, postId, users, level = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(level === 0) // Auto-expand first level

  // Only fetch replies if this is a top-level comment and replies are shown
  const replies = useQuery(api.comments.listReplies, showReplies ? { parentId: comment._id } : "skip") || []

  const author = users.find((u) => u.clerkId === comment.authorId)
  const hasReplies = comment.replyCount && comment.replyCount > 0

  const toggleReplies = () => {
    setShowReplies(!showReplies)
  }

  const handleReply = () => {
    setShowReplyForm(true)
    setShowReplies(true)
  }

  const handleReplyAdded = () => {
    setShowReplyForm(false)
  }

  // Limit nesting to 3 levels
  const canNest = level < 3

  return (
    <div className={`flex gap-2 ${level > 0 ? "mt-3" : ""}`}>
      <Avatar className={level > 0 ? "h-6 w-6" : "h-8 w-8"}>
        {author ? (
          <>
            <AvatarImage src={author.imageUrl} alt={author.name} />
            <AvatarFallback>{author.name.substring(0, 2)}</AvatarFallback>
          </>
        ) : (
          <AvatarFallback>
            <Skeleton className={level > 0 ? "h-6 w-6" : "h-8 w-8"} rounded-full />
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className={`font-medium ${level > 0 ? "text-xs" : "text-sm"}`}>{author?.name || "Unknown"}</span>
          <span className={`text-muted-foreground ${level > 0 ? "text-xs" : "text-xs"}`}>
            {formatDistanceToNow(new Date(comment._creationTime), { addSuffix: true })}
          </span>
        </div>
        <p className={level > 0 ? "text-xs" : "text-sm"}>{comment.content}</p>

        <div className="flex items-center gap-2 mt-1">
          <CommentLikeButton commentId={comment._id} likes={comment.likes || []} size={level > 0 ? "xs" : "sm"} />

          {canNest && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReply}
              className={`text-muted-foreground hover:text-primary ${level > 0 ? "text-xs py-0 px-1 h-6" : "text-sm"}`}
            >
              <MessageSquare className={level > 0 ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />
              Reply
            </Button>
          )}

          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleReplies}
              className={`text-muted-foreground hover:text-primary ${level > 0 ? "text-xs py-0 px-1 h-6" : "text-sm"}`}
            >
              {showReplies ? (
                <>
                  <ChevronUp className={level > 0 ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />
                  Hide replies
                </>
              ) : (
                <>
                  <ChevronDown className={level > 0 ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />
                  Show {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
                </>
              )}
            </Button>
          )}
        </div>

        {showReplyForm && (
          <ReplyForm
            postId={postId}
            parentId={comment._id}
            onReplyAdded={handleReplyAdded}
            onCancel={() => setShowReplyForm(false)}
          />
        )}

        {showReplies && replies.length > 0 && (
          <div className={`space-y-0 pl-2 border-l-2 border-muted ml-1 mt-2`}>
            {replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} postId={postId} users={users} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

