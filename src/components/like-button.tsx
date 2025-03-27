"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "../..//convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import type { Id } from "../../convex/_generated/dataModel"

interface LikeButtonProps {
  postId: Id<"posts">
  likes: string[]
  className?: string
}

export function LikeButton({ postId, likes, className = "" }: LikeButtonProps) {
  const { user } = useUser()
  const [optimisticLikes, setOptimisticLikes] = useState<string[]>(likes)
  const [isLiking, setIsLiking] = useState(false)

  const createLike = useMutation(api.likes.create)

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
      await createLike({ postId, userId: user.id })
    } catch (error) {
      console.error("Failed to like post:", error)
      // Revert optimistic update on error
      setOptimisticLikes(likes)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLiking || !user}
      className={`text-muted-foreground hover:text-primary ${className}`}
    >
      <Heart className={`h-4 w-4 mr-1 transition-all ${isLiked ? "fill-primary text-primary" : ""}`} />
      {optimisticLikes.length}
    </Button>
  )
}

