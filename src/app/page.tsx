"use client"

import { useAuth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { Feed } from "@/components/feed"
import { Header } from "@/components/header"

export default function Home() {
  const { userId } = useAuth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container max-w-5xl mx-auto py-6 px-4">
        <Feed />
      </main>
    </div>
  )
}

