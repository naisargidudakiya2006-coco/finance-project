"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Tag, Trash2 } from "lucide-react";

import { readJson } from "@/lib/read-json";

type UserRole = "STUDENT" | "EMPLOYEE";

type Transaction = {
  amount: number;
  date: string;
  id: number;
  name: string;
  type: "expense" | "salary" | "pocketmoney";
};

export default function History({
  onDeleted,
  refreshKey,
  role,
}: {
  onDeleted: () => void;
  refreshKey: number;
  role: UserRole;
}) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/transactions", { cache: "no-store" });
        const result = await readJson<Transaction[]>(response);

        if (!response.ok || !Array.isArray(result)) {
          throw new Error("Failed to load history");
        }

        setData(
          result.map((transaction) => ({
            ...transaction,
            amount: Number(transaction.amount),
          }))
        );
      } catch (error) {
        console.error("Failed to load history", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [refreshKey]);

  const deleteItem = async (id: number) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await readJson<{ success: boolean }>(response);
      setData((current) => current.filter((item) => item.id !== id));
      onDeleted();
    } catch (error) {
      console.error("Failed to delete transaction", error);
      alert("Delete failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/88 p-10 text-center text-sm font-semibold text-[var(--brand-base)] shadow-[0_25px_60px_rgba(74,21,75,0.12)]">
        Loading history...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_25px_60px_rgba(74,21,75,0.12)]">
        <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-base)] uppercase">History</p>
        <h2 className="mt-2 text-3xl font-black text-[var(--brand-ink)]">Transaction History</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
          Every row shows the category, date, amount, and a delete action. Spending is red, while {role === "STUDENT" ? "pocket money" : "salary"} stays green.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[var(--brand-magenta)]/20 bg-white/70 p-10 text-center text-sm text-[var(--brand-muted)]">
          No transactions yet. Add your first entry to populate history.
        </div>
      ) : (
        data.map((item) => {
          const isIncome = item.type === "salary" || item.type === "pocketmoney";
          const categoryLabel = isIncome ? (item.type === "pocketmoney" ? "Pocket Money" : "Salary") : item.name;

          return (
            <article
              className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/88 p-5 shadow-[0_22px_50px_rgba(74,21,75,0.1)] sm:flex-row sm:items-center sm:justify-between"
              key={item.id}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-[1.25rem] p-3 ${isIncome ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  <Tag size={18} />
                </div>

                <div>
                  <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-muted)] uppercase">Category</p>
                  <p className="mt-1 text-lg font-bold text-[var(--brand-ink)]">{categoryLabel}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--brand-muted)]">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={16} />
                      {new Date(item.date).toLocaleDateString("en-IN")}
                    </span>
                    <span className="rounded-full bg-[var(--brand-gold)]/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-base)]">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className={`text-right text-xl font-black ${isIncome ? "text-green-600" : "text-red-500"}`}>
                  {isIncome ? "+" : "-"} Rs. {item.amount.toLocaleString()}
                </div>

                <button
                  className="rounded-full border border-red-200 bg-red-50 p-3 text-red-500 transition hover:bg-red-100"
                  onClick={() => deleteItem(item.id)}
                  type="button"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
