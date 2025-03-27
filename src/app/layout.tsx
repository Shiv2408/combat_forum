"use client"

import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ConvexProvider } from "convex/react"
import { convex } from "@/lib/convex"
import "./globals.css"


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClerkProvider>
          <ConvexProviderWithClerk client={convex} useAuth={() => ({
            isLoaded: true,
            isSignedIn: true,
            getToken: async () => null,
            orgId: null,
            orgRole: null,
          })}>
            <ConvexProvider client={convex}>
                {children}
            </ConvexProvider>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
    
  )
}

