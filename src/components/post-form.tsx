"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"

export function PostForm() {
  const { user } = useUser()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createPost = useMutation(api.posts.create)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !content.trim()) return

    try {
      setIsSubmitting(true)
      await createPost({
        authorId: user.id,
        content: content.trim(),
      })
      setContent("")
    } catch (error) {
      console.error("Failed to create post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <Card className="mb-8">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
              <AvatarFallback>{user.firstName?.substring(0, 1) || "U"}</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={!content.trim() || isSubmitting}>
            {isSubmitting ? "Posting..." : "Post"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

