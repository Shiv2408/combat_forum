import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../../convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
  

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error verifying webhook", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, first_name, last_name, image_url, username } = evt.data

    // Create user in Convex
    await convex.mutation(api.users.create, {
      clerkId: id,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      username: username || id.substring(0, 8),
      imageUrl: image_url || `/placeholder.svg?height=40&width=40`,
    })
  }

  return new Response("Webhook received", {
    status: 200,
  })
}

