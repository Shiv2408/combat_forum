"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SendHorizontal, X } from "lucide-react"
import type { Id } from "../../convex/_generated/dataModel"

interface ReplyFormProps {
  postId: Id<"posts">
  parentId: Id<"comments">
  onReplyAdded?: () => void
  onCancel?: () => void
}

export function ReplyForm({ postId, parentId, onReplyAdded, onCancel }: ReplyFormProps) {
  const { user } = useUser()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createComment = useMutation(api.comments.create)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !content.trim()) return

    try {
      setIsSubmitting(true)
      await createComment({
        postId,
        authorId: user.id,
        content: content.trim(),
        parentId,
      })
      setContent("")
      onReplyAdded?.()
    } catch (error) {
      console.error("Failed to add reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2 pt-2 pl-6 mt-1">
      <Avatar className="h-6 w-6 mt-1">
        <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
        <AvatarFallback>{user.firstName?.substring(0, 1) || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 relative">
        <Textarea
          placeholder="Write a reply..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[40px] text-sm pr-16 resize-none"
          rows={1}
        />
        <div className="absolute right-2 top-2 flex gap-1">
          <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            disabled={!content.trim() || isSubmitting}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}

