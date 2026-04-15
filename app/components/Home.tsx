"use client";

import { useEffect, useMemo, useState } from "react";
import { PiggyBank, TriangleAlert, TrendingUp, Wallet } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { readJson } from "@/lib/read-json";

type UserRole = "STUDENT" | "EMPLOYEE";
type RangeKey = "daily" | "weekly" | "monthly";

type Transaction = {
  amount: number;
  date: string;
  id: number;
  name: string;
  type: "expense" | "salary" | "pocketmoney";
};

const COLORS = ["#4A154B", "#C13584", "#F56040", "#FFDC80"];

const RANGE_LABELS: Record<RangeKey, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const isInRange = (dateValue: string, range: RangeKey, now: Date) => {
  const date = new Date(dateValue);

  if (range === "daily") {
    return date.toDateString() === now.toDateString();
  }

  if (range === "weekly") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - 6);
    return date >= start && date <= now;
  }

  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

const isInPreviousRange = (dateValue: string, range: RangeKey, now: Date) => {
  const date = new Date(dateValue);

  if (range === "daily") {
    const previousDay = new Date(now);
    previousDay.setDate(now.getDate() - 1);
    return date.toDateString() === previousDay.toDateString();
  }

  if (range === "weekly") {
    const previousStart = new Date(now);
    previousStart.setHours(0, 0, 0, 0);
    previousStart.setDate(now.getDate() - 13);

    const previousEnd = new Date(now);
    previousEnd.setHours(23, 59, 59, 999);
    previousEnd.setDate(now.getDate() - 7);

    return date >= previousStart && date <= previousEnd;
  }

  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return date.getMonth() === previousMonth.getMonth() && date.getFullYear() === previousMonth.getFullYear();
};

export default function Home({ refreshKey, role }: { refreshKey: number; role: UserRole }) {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("monthly");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/transactions", { cache: "no-store" });
        const data = await readJson<Transaction[]>(response);

        if (!response.ok || !Array.isArray(data)) {
          throw new Error("Failed to load transactions");
        }

        setTransactions(
          data.map((transaction) => ({
            ...transaction,
            amount: Number(transaction.amount),
          }))
        );
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    void loadTransactions();
  }, [refreshKey]);

  const stats = useMemo(() => {
    const now = new Date();
    const filteredTransactions = transactions.filter((transaction) => isInRange(transaction.date, range, now));
    const previousTransactions = transactions.filter((transaction) => isInPreviousRange(transaction.date, range, now));
    const breakdown = new Map<string, number>();
    let income = 0;
    let expense = 0;
    let previousExpense = 0;

    for (const transaction of filteredTransactions) {
      if (transaction.type === "expense") {
        expense += transaction.amount;
        breakdown.set(transaction.name, (breakdown.get(transaction.name) ?? 0) + transaction.amount);
      } else {
        income += transaction.amount;
      }
    }

    for (const transaction of previousTransactions) {
      if (transaction.type === "expense") {
        previousExpense += transaction.amount;
      }
    }

    const topCategory = Array.from(breakdown.entries()).sort((a, b) => b[1] - a[1])[0] ?? null;

    return {
      balance: income - expense,
      categories: Array.from(breakdown.entries()).map(([name, value]) => ({
        name,
        value,
      })),
      expense,
      filteredTransactions,
      income,
      previousExpense,
      topCategory,
    };
  }, [range, transactions]);

  const comparisonMessage = useMemo(() => {
    const previousExpense = stats.previousExpense;
    const currentExpense = stats.expense;
    const label =
      range === "daily" ? "yesterday" : range === "weekly" ? "last week" : "last month";

    if (previousExpense <= 0 && currentExpense <= 0) {
      return null;
    }

    if (previousExpense <= 0 && currentExpense > 0) {
      return `You started spending in this ${range}. No ${label} expense data to compare yet.`;
    }

    const changePercent = Math.round(((currentExpense - previousExpense) / previousExpense) * 100);

    if (changePercent === 0) {
      return `Your spending is exactly the same as ${label}.`;
    }

    if (changePercent > 0) {
      return `You spent ${changePercent}% more than ${label}.`;
    }

    return `You spent ${Math.abs(changePercent)}% less than ${label}.`;
  }, [range, stats.expense, stats.previousExpense]);

  const nudges = useMemo(() => {
    const items: Array<{
      icon: typeof PiggyBank;
      id: string;
      text: string;
      tone: string;
      title: string;
    }> = [];

    if (comparisonMessage) {
      items.push({
        icon: TrendingUp,
        id: "comparison",
        title: `${RANGE_LABELS[range]} comparison`,
        text: comparisonMessage,
        tone: "border-[var(--brand-base)] bg-[var(--brand-base)]/10 text-[var(--brand-base)]",
      });
    }

    if (stats.topCategory) {
      items.push({
        icon: TriangleAlert,
        id: "category",
        title: "Highest spending category",
        text: `${stats.topCategory[0]} is your highest spending category in this ${range} at Rs. ${stats.topCategory[1].toLocaleString()}.`,
        tone: "border-[var(--brand-orange)] bg-[var(--brand-orange)]/12 text-[var(--brand-orange)]",
      });
    }

    if (stats.income === 0) {
      items.push({
        icon: Wallet,
        id: "income",
        title: role === "STUDENT" ? "Add your pocket money" : "Add your salary",
        text: role === "STUDENT" ? "Start by recording your latest pocket money so the app can calculate your real balance." : "Add your latest salary entry to unlock accurate balance and savings nudges.",
        tone: "border-[var(--brand-gold)] bg-[var(--brand-gold)]/18 text-[var(--brand-base)]",
      });
    }

    if (stats.expense >= 1000) {
      items.push({
        icon: TriangleAlert,
        id: "limit",
        title: "Spending alert",
        text: `Your ${range} spending has crossed Rs. 1000. Slow down a little before the next expense.`,
        tone: "border-[var(--brand-orange)] bg-[var(--brand-orange)]/12 text-[var(--brand-orange)]",
      });
    }

    if (stats.balance > 0) {
      items.push({
        icon: PiggyBank,
        id: "save",
        title: "Save first",
        text: "Nudge: keep at least 10% of your current balance aside before the next spend.",
        tone: "border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/10 text-[var(--brand-base)]",
      });
    }

    if (stats.balance >= 2000) {
      items.push({
        icon: TrendingUp,
        id: "invest",
        title: "Investment nudge",
        text: "You have healthy room in your balance. Consider moving Rs. 500 into savings or a simple investment option.",
        tone: "border-[var(--brand-base)] bg-[var(--brand-base)]/10 text-[var(--brand-base)]",
      });
    }

    return items;
  }, [comparisonMessage, range, role, stats.balance, stats.expense, stats.income, stats.topCategory]);

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-12 text-center text-sm font-semibold text-[var(--brand-base)] shadow-[0_25px_60px_rgba(74,21,75,0.12)]">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/88 p-4 shadow-[0_25px_60px_rgba(74,21,75,0.12)]">
        <div className="flex flex-wrap gap-3">
          {(["daily", "weekly", "monthly"] as RangeKey[]).map((item) => (
            <button
              key={item}
              className={`rounded-full px-5 py-2 text-sm font-black tracking-[0.15em] uppercase transition ${
                range === item
                  ? "bg-[var(--brand-base)] text-white"
                  : "bg-[var(--brand-gold)]/25 text-[var(--brand-base)]"
              }`}
              onClick={() => setRange(item)}
              type="button"
            >
              {RANGE_LABELS[item]}
            </button>
          ))}
        </div>
      </section>

      {nudges.length ? (
        <div className="grid gap-4">
          {nudges.map(({ icon: Icon, id, text, title, tone }) => (
            <div key={id} className={`rounded-[1.75rem] border p-4 shadow-[0_20px_45px_rgba(74,21,75,0.08)] ${tone}`}>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white/70 p-3">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-black tracking-[0.22em] uppercase">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--brand-ink)]">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-[2rem] bg-[linear-gradient(135deg,var(--brand-base),var(--brand-magenta),var(--brand-orange))] p-6 text-white shadow-[0_30px_65px_rgba(74,21,75,0.28)]">
          <p className="text-xs font-black tracking-[0.22em] uppercase text-white/75">Available Balance</p>
          <h2 className="mt-3 text-4xl font-black">Rs. {stats.balance.toLocaleString()}</h2>
          <p className="mt-3 text-sm text-white/80">This is your current {range} money after expenses.</p>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_25px_60px_rgba(74,21,75,0.12)]">
          <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-magenta)] uppercase">
            {role === "STUDENT" ? "Pocket Money" : "Salary"}
          </p>
          <h2 className="mt-3 text-3xl font-black text-[var(--brand-ink)]">Rs. {stats.income.toLocaleString()}</h2>
          <p className="mt-3 text-sm text-[var(--brand-muted)]">Total incoming money recorded for this {range}.</p>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_25px_60px_rgba(74,21,75,0.12)]">
          <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-orange)] uppercase">Expenses</p>
          <h2 className="mt-3 text-3xl font-black text-[var(--brand-ink)]">Rs. {stats.expense.toLocaleString()}</h2>
          <p className="mt-3 text-sm text-[var(--brand-muted)]">All spending entries tracked for this {range}.</p>
        </section>
      </div>

      <section className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_25px_60px_rgba(74,21,75,0.12)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-base)] uppercase">Spending Breakdown</p>
            <h3 className="mt-2 text-2xl font-black text-[var(--brand-ink)]">Where your money is going</h3>
          </div>
          <div className="rounded-full bg-[var(--brand-gold)]/35 px-4 py-2 text-xs font-bold text-[var(--brand-base)]">
            {stats.filteredTransactions.length} entries
          </div>
        </div>

        {stats.categories.length ? (
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.categories} dataKey="value" nameKey="name" outerRadius={105}>
                  {stats.categories.map((entry, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `Rs. ${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--brand-magenta)]/25 bg-[var(--brand-magenta)]/5 p-8 text-center text-sm text-[var(--brand-muted)]">
            Add a few expenses in this {range} view and your category chart will appear here.
          </div>
        )}
      </section>
    </div>
  );
}
