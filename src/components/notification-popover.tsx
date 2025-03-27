"use client"

import { useState, useCallback, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { useUser } from "@clerk/nextjs"
import { Bell } from "lucide-react"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { api } from "../../convex/_generated/api"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

export function NotificationPopover() {
  const { user } = useUser()
  const [open, setOpen] = useState(false)

  const notifications =
    useQuery(api.notifications.list, {
      userId: user?.id || "",
    }) || []

  const users = useQuery(api.users.list) || []

  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsReadMutation = useMutation(api.notifications.markAllAsRead)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Mark notifications as read when opening the popover
  useEffect(() => {
    if (open && unreadCount > 0) {
      notifications
        .filter((n) => !n.read)
        .forEach((notification) => {
          markAsRead({ notificationId: notification._id })
        })
    }
  }, [open, notifications, unreadCount, markAsRead])

  const handleMarkAllAsRead = useCallback(async () => {
    if (user?.id) {
      await markAllAsReadMutation({ userId: user.id })
    }
  }, [user?.id, markAllAsReadMutation])

  // Find user data for notification actors
  const getActorData = (actorId: string) => {
    return users.find((u) => u.clerkId === actorId)
  }

  // Get notification message based on type
  const getNotificationMessage = (notification: any) => {
    const actor = getActorData(notification.actorId)
    const actorName = actor?.name || "Someone"

    switch (notification.type) {
      case "follow":
        return `${actorName} started following you`
      case "like":
        return `${actorName} liked your post`
      case "comment":
        return `${actorName} commented on your post`
      case "reply":
        return `${actorName} replied to your comment`
      case "comment_like":
        return `${actorName} liked your comment`
      default:
        return notification.content
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const actor = getActorData(notification.actorId)
                return (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-muted/50 ${!notification.read ? "bg-muted/20" : ""}`}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        {actor ? (
                          <>
                            <AvatarImage src={actor.imageUrl} alt={actor.name} />
                            <AvatarFallback>{actor.name.substring(0, 2)}</AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback>
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">{getNotificationMessage(notification)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification._creationTime), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

