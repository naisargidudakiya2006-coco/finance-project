import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

const VALID_TYPES = new Set(["expense", "salary", "pocketmoney"]);

type TransactionBody = {
  amount?: number;
  date?: string;
  name?: string;
  source?: string;
  type?: string;
};

const getOrCreateDbUser = async (userId: string) => {
  const existingUser = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (existingUser) {
    return existingUser;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    return null;
  }

  return db.user.create({
    data: {
      clerkId: userId,
      email,
      role: null,
      username:
        clerkUser.fullName ??
        clerkUser.username ??
        clerkUser.firstName ??
        clerkUser.lastName ??
        undefined,
    },
    select: {
      id: true,
      role: true,
    },
  });
};

export async function GET() {
  try {
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

    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions failed", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as TransactionBody;
    const amount = Number(body.amount);
    const requestedType = body.type?.toLowerCase();
    const name = body.name?.trim();
    const source = body.source?.trim() || null;
    const parsedDate = body.date ? new Date(body.date) : new Date();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    if (!requestedType || !VALID_TYPES.has(requestedType)) {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
    }

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const user = await getOrCreateDbUser(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const normalizedType =
      requestedType === "expense"
        ? "expense"
        : user.role === "STUDENT"
          ? "pocketmoney"
          : "salary";

    const normalizedName =
      normalizedType === "expense"
        ? name || "Expense"
        : normalizedType === "pocketmoney"
          ? "Pocket Money"
          : "Salary";

    const transaction = await db.transaction.create({
      data: {
        amount,
        date: parsedDate,
        name: normalizedName,
        source,
        type: normalizedType,
        userId: user.id,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions failed", error);
    return NextResponse.json({ error: "Failed to save transaction" }, { status: 500 });
  }
}
