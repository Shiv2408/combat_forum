"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
import { CommentForm } from "./comment-form"
import { CommentItem } from "./comment-item"
import type { Id } from "../../convex/_generated/dataModel"

interface CommentsProps {
  postId: Id<"posts">
}

export function Comments({ postId }: CommentsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)

  const allComments = useQuery(api.comments.listByPost, { postId }) || []
  const users = useQuery(api.users.list) || []

  // Filter to get only top-level comments
  const comments = allComments.filter((comment) => !comment.parentId)

  const commentCount = allComments.length

  const toggleComments = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded && !showCommentForm) {
      setShowCommentForm(true)
    }
  }

  const handleAddComment = () => {
    setShowCommentForm(true)
    setIsExpanded(true)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={toggleComments}>
          <MessageCircle className="h-4 w-4 mr-1" />
          {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
          {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </Button>

        {!showCommentForm && (
          <Button variant="ghost" size="sm" onClick={handleAddComment}>
            Add comment
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-2">
          {comments.length > 0 && (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment._id} comment={comment} postId={postId} users={users} />
              ))}
            </div>
          )}

          {showCommentForm && <CommentForm postId={postId} onCommentAdded={() => setShowCommentForm(false)} />}
        </div>
      )}
    </div>
  )
}

