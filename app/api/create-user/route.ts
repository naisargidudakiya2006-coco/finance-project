import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      clerkId?: string;
      email?: string;
      username?: string;
    };

    const clerkId = body.clerkId?.trim();
    const email = body.email?.trim();

    if (!clerkId || !email) {
      return NextResponse.json({ error: "Missing clerkId or email" }, { status: 400 });
    }

    const user = await db.user.upsert({
      where: { clerkId },
      update: {
        email,
        username: body.username?.trim() || undefined,
      },
      create: {
        clerkId,
        email,
        role: null,
        username: body.username?.trim() || undefined,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("POST /api/create-user failed", error);
    return NextResponse.json({ error: "Create user failed" }, { status: 500 });
  }
}
