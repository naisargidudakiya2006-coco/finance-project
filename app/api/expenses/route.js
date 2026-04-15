import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json([], { status: 200 });
  }

  const expenses = await db.transaction.findMany({
    where: {
      userId: user.id,
      type: "expense",
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(expenses);
}

export async function POST(req) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const amount = Number(body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
  }

  const user = await db.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: {
      clerkId: userId,
      role: null,
    },
    select: { id: true },
  });

  const expense = await db.transaction.create({
    data: {
      name: body.name?.trim() || body.category?.trim() || "Expense",
      amount,
      type: "expense",
      source: body.source?.trim() || null,
      date: body.date ? new Date(body.date) : new Date(),
      userId: user.id,
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
