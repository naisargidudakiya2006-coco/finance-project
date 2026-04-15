import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

const VALID_ROLES = new Set(["STUDENT", "EMPLOYEE"]);

const getClerkProfile = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    return null;
  }

  return {
    email,
    username:
      clerkUser.fullName ??
      clerkUser.username ??
      clerkUser.firstName ??
      clerkUser.lastName ??
      null,
  };
};

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkProfile = await getClerkProfile();

    if (!clerkProfile) {
      return NextResponse.json({ error: "Clerk profile not available" }, { status: 400 });
    }

    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {
        email: clerkProfile.email,
        username: clerkProfile.username ?? undefined,
      },
      create: {
        clerkId: userId,
        email: clerkProfile.email,
        role: null,
        username: clerkProfile.username ?? undefined,
      },
      select: {
        id: true,
        clerkId: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/user failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { role?: string };
    const role = body.role?.toUpperCase();

    if (!role || !VALID_ROLES.has(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const clerkProfile = await getClerkProfile();

    if (!clerkProfile) {
      return NextResponse.json({ error: "Clerk profile not available" }, { status: 400 });
    }

    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {
        email: clerkProfile.email,
        role,
        username: clerkProfile.username ?? undefined,
      },
      create: {
        clerkId: userId,
        email: clerkProfile.email,
        role,
        username: clerkProfile.username ?? undefined,
      },
      select: {
        id: true,
        clerkId: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("PATCH /api/user failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
