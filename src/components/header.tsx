"use client"

import Link from "next/link"
import { UserButton, useUser } from "@clerk/nextjs"
import { NotificationPopover } from "./notification-popover"
import { Button } from "@/components/ui/button"

export function Header() {
  const { isSignedIn } = useUser()

  return (
    <header className="border-b">
      <div className="container max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="font-bold text-xl">
          SocialApp
        </Link>

        {isSignedIn ? (
          <div className="flex items-center gap-4">
            <NotificationPopover />
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

