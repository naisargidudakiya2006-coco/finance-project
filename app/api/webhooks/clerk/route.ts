import { NextResponse } from "next/server";

import { db } from "@/lib/db";

type ClerkWebhookPayload = {
  type?: string;
  data?: {
    email_addresses?: Array<{ email_address?: string }>;
    first_name?: string | null;
    id?: string;
    last_name?: string | null;
    username?: string | null;
  };
};

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as ClerkWebhookPayload;
    const clerkId = payload.data?.id?.trim();

    if (!payload.type || !clerkId) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    if (payload.type === "user.created") {
      const email = payload.data?.email_addresses?.[0]?.email_address?.trim();
      const username =
        payload.data?.username?.trim() ||
        [payload.data?.first_name, payload.data?.last_name].filter(Boolean).join(" ").trim() ||
        undefined;

      if (!email) {
        return NextResponse.json({ error: "Missing email in webhook payload" }, { status: 400 });
      }

      await db.user.upsert({
        where: { clerkId },
        update: {
          email,
          username,
        },
        create: {
          clerkId,
          email,
          role: null,
          username,
        },
      });
    }

    if (payload.type === "user.deleted") {
      await db.user.deleteMany({
        where: { clerkId },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("POST /api/webhooks/clerk failed", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
