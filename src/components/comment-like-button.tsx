"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import type { Id } from "../../convex/_generated/dataModel"

interface CommentLikeButtonProps {
  commentId: Id<"comments">
  likes: string[]
  className?: string
  size?: "xs" | "sm"
}

export function CommentLikeButton({ commentId, likes, className = "", size = "sm" }: CommentLikeButtonProps) {
  const { user } = useUser()
  const [optimisticLikes, setOptimisticLikes] = useState<string[]>(likes)
  const [isLiking, setIsLiking] = useState(false)

  const toggleLike = useMutation(api.comments.toggleLike)

  const isLiked = user ? optimisticLikes.includes(user.id) : false

  const handleLike = async () => {
    if (!user) return

    try {
      setIsLiking(true)

      // Optimistic update
      if (isLiked) {
        setOptimisticLikes(optimisticLikes.filter((id) => id !== user.id))
      } else {
        setOptimisticLikes([...optimisticLikes, user.id])
      }

      // Actual API call
      await toggleLike({ commentId, userId: user.id })
    } catch (error) {
      console.error("Failed to like comment:", error)
      // Revert optimistic update on error
      setOptimisticLikes(likes)
    } finally {
      setIsLiking(false)
    }
  }

  const sizeClasses = size === "xs" ? "text-xs py-0 px-1 h-6" : "text-sm py-1 px-2"

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLiking || !user}
      className={`text-muted-foreground hover:text-primary ${sizeClasses} ${className}`}
    >
      <Heart
        className={`${size === "xs" ? "h-3 w-3" : "h-4 w-4"} mr-1 transition-all ${isLiked ? "fill-primary text-primary" : ""}`}
      />
      {optimisticLikes.length > 0 && optimisticLikes.length}
    </Button>
  )
}

