"use client"

import { useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { useUser } from "@clerk/nextjs"
import { api } from "../../convex/_generated/api"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus } from "lucide-react"
import { PostForm } from "./post-form"
import { LikeButton } from "./like-button"
import { Comments } from "./comments"
import { Skeleton } from "@/components/ui/skeleton"

export function Feed() {
  const { user, isLoaded } = useUser()
  const posts = useQuery(api.posts.list) || []
  const users = useQuery(api.users.list) || []

  const createUser = useMutation(api.users.create)
  const toggleFollow = useMutation(api.users.toggleFollow)

  // Ensure current user is in the database
  useEffect(() => {
    if (isLoaded && user) {
      createUser({
        clerkId: user.id,
        name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        username: user.username || user.id.substring(0, 8),
        imageUrl: user.imageUrl || `/placeholder.svg?height=40&width=40`,
      })
    }
  }, [isLoaded, user, createUser])

  // Filter out the current user
  const otherUsers = users.filter((u) => u.clerkId !== user?.id)

  const handleFollow = async (targetUserId: string) => {
    if (!user) return
    await toggleFollow({
      followerId: user.id,
      followingId: targetUserId,
    })
  }

  const isFollowing = (userId: string) => {
    const currentUser = users.find((u) => u.clerkId === user?.id)
    return currentUser?.following?.includes(userId) || false
  }

  if (!isLoaded) {
    return <LoadingFeed />
  }

  return (
    <div className="space-y-8">
      {/* Post creation form */}
      <PostForm />

      {/* People to follow section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">People to follow</h2>
        {otherUsers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">No other users to follow yet.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherUsers.map((otherUser) => (
              <Card key={otherUser._id}>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar>
                    <AvatarImage src={otherUser.imageUrl} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{otherUser.name}</h3>
                    <p className="text-sm text-muted-foreground">@{otherUser.username}</p>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant={isFollowing(otherUser.clerkId) ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={() => handleFollow(otherUser.clerkId)}
                  >
                    {isFollowing(otherUser.clerkId) ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Posts section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Latest Posts</h2>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No posts yet. Be the first to share something!
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => {
              const author = users.find((u) => u.clerkId === post.authorId)
              return (
                <Card key={post._id}>
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar>
                      <AvatarImage src={author?.imageUrl} alt={author?.name} />
                      <AvatarFallback>{author?.name?.substring(0, 2) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{author?.name}</h3>
                      <p className="text-sm text-muted-foreground">@{author?.username}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{post.content}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start">
                    <div className="flex items-center w-full">
                      <LikeButton postId={post._id} likes={post.likes || []} />
                    </div>
                    <Comments postId={post._id} />
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

function LoadingFeed() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>

      <section className="mb-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Skeleton className="h-10 w-36 mb-4" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

