"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CalendarDaysIcon, TrendingUpIcon } from "./Icons";
import { readJson } from "@/lib/read-json";

type Transaction = {
  amount: number;
  date: string;
  id: number;
  name: string;
  type: "expense" | "salary" | "pocketmoney";
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeStart = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const normalizeEnd = (date: Date) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const getDefaultStartDate = () => {
  const today = new Date();
  return formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1));
};

const getDefaultEndDate = () => formatDateInput(new Date());

const isInRange = (dateValue: string, startDate: string, endDate: string) => {
  const date = new Date(dateValue);
  return date >= normalizeStart(new Date(startDate)) && date <= normalizeEnd(new Date(endDate));
};

const formatMonthKey = (dateValue: string) => {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
};

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
};

export default function Insights({ refreshKey }: { refreshKey: number }) {
  const [analysisCategory, setAnalysisCategory] = useState("");
  const [data, setData] = useState<Transaction[]>([]);
  const [dateFrom, setDateFrom] = useState(getDefaultStartDate);
  const [dateTo, setDateTo] = useState(getDefaultEndDate);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/transactions", { cache: "no-store" });
        const result = await readJson<Transaction[]>(response);

        if (!response.ok || !Array.isArray(result)) {
          throw new Error("Failed to load insights");
        }

        setData(
          result.map((transaction) => ({
            ...transaction,
            amount: Number(transaction.amount),
          }))
        );
      } catch (error) {
        console.error("Failed to load insights", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [refreshKey]);

  const expenseCategories = useMemo(() => {
    return Array.from(
      new Set(
        data
          .filter((item) => item.type === "expense")
          .map((item) => item.name)
          .sort((a, b) => a.localeCompare(b))
      )
    );
  }, [data]);

  useEffect(() => {
    if (!analysisCategory || !expenseCategories.includes(analysisCategory)) {
      setAnalysisCategory(expenseCategories[0] ?? "");
    }
  }, [analysisCategory, expenseCategories]);

  const analysis = useMemo(() => {
    if (!analysisCategory) {
      return null;
    }

    const safeDateTo = dateFrom > dateTo ? dateFrom : dateTo;
    const categoryTransactions = data.filter(
      (item) => item.type === "expense" && item.name === analysisCategory && isInRange(item.date, dateFrom, safeDateTo)
    );

    if (!categoryTransactions.length) {
      return {
        averagePerMonth: 0,
        chartData: [],
        highestMonth: null as null | { label: string; value: number },
        totalSpent: 0,
      };
    }

    const monthTotals = new Map<string, number>();

    for (const item of categoryTransactions) {
      const monthKey = formatMonthKey(item.date);
      monthTotals.set(monthKey, (monthTotals.get(monthKey) ?? 0) + item.amount);
    }

    const chartData = Array.from(monthTotals.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({
        amount,
        label: formatMonthLabel(month),
        month,
      }));

    const totalSpent = categoryTransactions.reduce((sum, item) => sum + item.amount, 0);
    const highestMonth = [...chartData].sort((a, b) => b.amount - a.amount)[0] ?? null;

    return {
      averagePerMonth: Math.round(totalSpent / chartData.length),
      chartData,
      highestMonth: highestMonth ? { label: highestMonth.label, value: highestMonth.amount } : null,
      totalSpent,
    };
  }, [analysisCategory, data, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="rounded-[1.6rem] border border-white/70 bg-white/88 p-8 text-center text-sm font-semibold text-[var(--brand-base)] shadow-[0_25px_60px_rgba(74,21,75,0.12)] sm:rounded-[2rem] sm:p-10">
        Loading insights...
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="rounded-[1.6rem] border border-white/70 bg-white/88 p-5 shadow-[0_25px_60px_rgba(74,21,75,0.12)] sm:rounded-[2rem] sm:p-6">
        <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-magenta)] uppercase">Insights</p>
        <h2 className="mt-2 text-2xl font-black text-[var(--brand-ink)] sm:text-3xl">Category Analysis</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
          Explore one expense category across the selected date range and see how your monthly spending pattern changes over time.
        </p>
      </div>

      <section className="rounded-[1.6rem] border border-white/70 bg-white/88 p-5 shadow-[0_25px_60px_rgba(74,21,75,0.12)] sm:rounded-[2rem] sm:p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">
              <CalendarDaysIcon size={16} />
              From
            </span>
            <input
              className="min-h-12 rounded-[1.1rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white"
              max={dateTo}
              onChange={(event) => setDateFrom(event.target.value)}
              type="date"
              value={dateFrom}
            />
          </label>

          <label className="grid gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">
              <CalendarDaysIcon size={16} />
              To
            </span>
            <input
              className="min-h-12 rounded-[1.1rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white"
              min={dateFrom}
              onChange={(event) => setDateTo(event.target.value)}
              type="date"
              value={dateTo}
            />
          </label>

          <label className="grid gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">
              <TrendingUpIcon size={16} />
              Category
            </span>
            <select
              className="min-h-12 rounded-[1.1rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white"
              onChange={(event) => setAnalysisCategory(event.target.value)}
              value={analysisCategory}
            >
              {expenseCategories.length ? (
                expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))
              ) : (
                <option value="">No expense categories yet</option>
              )}
            </select>
          </label>
        </div>
      </section>

      {analysisCategory && analysis ? (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.35rem] bg-[var(--brand-base)]/10 p-4">
              <p className="text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">Total Spent</p>
              <p className="mt-2 text-2xl font-black text-[var(--brand-ink)]">Rs. {analysis.totalSpent.toLocaleString()}</p>
            </div>

            <div className="rounded-[1.35rem] bg-[var(--brand-magenta)]/10 p-4">
              <p className="text-xs font-black tracking-[0.18em] text-[var(--brand-magenta)] uppercase">Average Per Month</p>
              <p className="mt-2 text-2xl font-black text-[var(--brand-ink)]">Rs. {analysis.averagePerMonth.toLocaleString()}</p>
            </div>

            <div className="rounded-[1.35rem] bg-[var(--brand-orange)]/10 p-4">
              <p className="text-xs font-black tracking-[0.18em] text-[var(--brand-orange)] uppercase">Highest Month</p>
              <p className="mt-2 text-lg font-black text-[var(--brand-ink)]">
                {analysis.highestMonth ? `${analysis.highestMonth.label} - Rs. ${analysis.highestMonth.value.toLocaleString()}` : "No data yet"}
              </p>
            </div>
          </div>

          {analysis.chartData.length ? (
            <section className="rounded-[1.6rem] border border-white/70 bg-white/88 p-5 shadow-[0_25px_60px_rgba(74,21,75,0.12)] sm:rounded-[2rem] sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-base)] uppercase">Monthly Trend</p>
                  <h3 className="mt-2 text-xl font-black text-[var(--brand-ink)] sm:text-2xl">{analysisCategory} spending trend</h3>
                </div>
                <div className="rounded-full bg-[var(--brand-gold)]/35 px-4 py-2 text-xs font-bold text-[var(--brand-base)]">
                  {analysis.chartData.length} monthly points
                </div>
              </div>

              <div className="mt-6 h-[280px] sm:h-[360px]">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={analysis.chartData} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid stroke="rgba(74,21,75,0.12)" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="label" stroke="#4A154B" tickLine={false} axisLine={false} />
                    <YAxis
                      axisLine={false}
                      stroke="#4A154B"
                      tickFormatter={(value) => `Rs. ${Number(value).toLocaleString()}`}
                      tickLine={false}
                      width={88}
                    />
                    <Tooltip
                      formatter={(value) => `Rs. ${Number(value ?? 0).toLocaleString()}`}
                      labelFormatter={(label) => `${analysisCategory} in ${label}`}
                    />
                    <Bar dataKey="amount" fill="#C13584" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-[var(--brand-magenta)]/25 bg-white/80 p-8 text-center text-sm text-[var(--brand-muted)] sm:rounded-[2rem]">
              No {analysisCategory.toLowerCase()} spending was found inside this selected date range.
            </div>
          )}
        </>
      ) : (
        <div className="rounded-[1.6rem] border border-dashed border-[var(--brand-magenta)]/25 bg-white/80 p-8 text-center text-sm text-[var(--brand-muted)] sm:rounded-[2rem]">
          Add expense categories first to unlock insights.
        </div>
      )}
    </div>
  );
}
