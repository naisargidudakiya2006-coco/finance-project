import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = Number(id);

    if (!Number.isInteger(transactionId)) {
      return NextResponse.json({ error: "Invalid transaction id" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const deleted = await db.transaction.deleteMany({
      where: {
        id: transactionId,
        userId: user.id,
      },
    });

    if (!deleted.count) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id] failed", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
