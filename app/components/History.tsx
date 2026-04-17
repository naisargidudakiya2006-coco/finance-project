"use client";

import { useEffect, useMemo, useState } from "react";

import { CalendarDaysIcon, TagIcon, Trash2Icon } from "./Icons";
import { readJson } from "@/lib/read-json";

type UserRole = "STUDENT" | "EMPLOYEE";

type Transaction = {
  amount: number;
  date: string;
  id: number;
  name: string;
  type: "expense" | "salary" | "pocketmoney";
};

type HistoryFilter = "all" | "expense" | "income";

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
  const [dateFrom, setDateFrom] = useState(getDefaultStartDate);
  const [dateTo, setDateTo] = useState(getDefaultEndDate);
  const [filterType, setFilterType] = useState<HistoryFilter>("all");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

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
    if (selectedCategory !== "all" && !expenseCategories.includes(selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [expenseCategories, selectedCategory]);

  const filteredHistory = useMemo(() => {
    const safeDateTo = dateFrom > dateTo ? dateFrom : dateTo;

    return data.filter((item) => {
      const isIncome = item.type === "salary" || item.type === "pocketmoney";
      const matchesDate = isInRange(item.date, dateFrom, safeDateTo);
      const matchesType =
        filterType === "all" ? true : filterType === "income" ? isIncome : item.type === "expense";
      const matchesCategory =
        selectedCategory === "all"
          ? true
          : item.type === "expense"
            ? item.name === selectedCategory
            : false;

      return matchesDate && matchesType && matchesCategory;
    });
  }, [data, dateFrom, dateTo, filterType, selectedCategory]);

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
      <div className="rounded-[1.6rem] border border-white/70 bg-white/88 p-8 text-center text-sm font-semibold text-[var(--brand-base)] shadow-[0_25px_60px_rgba(74,21,75,0.12)] sm:rounded-[2rem] sm:p-10">
        Loading history...
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="rounded-[1.6rem] border border-white/70 bg-white/88 p-5 shadow-[0_25px_60px_rgba(74,21,75,0.12)] sm:rounded-[2rem] sm:p-6">
        <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-base)] uppercase">History</p>
        <h2 className="mt-2 text-2xl font-black text-[var(--brand-ink)] sm:text-3xl">Transaction History</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
          Every row shows the category, date, amount, and a delete action. Spending is red, while {role === "STUDENT" ? "pocket money" : "salary"} stays green.
        </p>
      </div>

      <section className="rounded-[1.6rem] border border-white/70 bg-white/88 p-5 shadow-[0_25px_60px_rgba(74,21,75,0.12)] sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-orange)] uppercase">Filters</p>
            <h3 className="mt-2 text-xl font-black text-[var(--brand-ink)] sm:text-2xl">Refine your history</h3>
          </div>
          <div className="rounded-full bg-[var(--brand-gold)]/35 px-4 py-2 text-xs font-bold text-[var(--brand-base)]">
            {filteredHistory.length} matching entries
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
            <span className="text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">Type</span>
            <select
              className="min-h-12 rounded-[1.1rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white"
              onChange={(event) => setFilterType(event.target.value as HistoryFilter)}
              value={filterType}
            >
              <option value="all">All Transactions</option>
              <option value="expense">Expenses Only</option>
              <option value="income">{role === "STUDENT" ? "Pocket Money Only" : "Salary Only"}</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">Category</span>
            <select
              className="min-h-12 rounded-[1.1rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white"
              onChange={(event) => setSelectedCategory(event.target.value)}
              value={selectedCategory}
            >
              <option value="all">All Categories</option>
              {expenseCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {filteredHistory.length === 0 ? (
        <div className="rounded-[1.6rem] border border-dashed border-[var(--brand-magenta)]/20 bg-white/70 p-8 text-center text-sm text-[var(--brand-muted)] sm:rounded-[2rem] sm:p-10">
          No transactions match your current filters. Try another date range or category.
        </div>
      ) : (
        filteredHistory.map((item) => {
          const isIncome = item.type === "salary" || item.type === "pocketmoney";
          const categoryLabel = isIncome ? (item.type === "pocketmoney" ? "Pocket Money" : "Salary") : item.name;

          return (
            <article
              className="flex flex-col gap-4 rounded-[1.45rem] border border-white/70 bg-white/88 p-4 shadow-[0_22px_50px_rgba(74,21,75,0.1)] sm:flex-row sm:items-center sm:justify-between sm:rounded-[1.75rem] sm:p-5"
              key={item.id}
            >
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div className={`shrink-0 rounded-[1rem] p-3 sm:rounded-[1.25rem] ${isIncome ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  <TagIcon size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-muted)] uppercase">Category</p>
                  <p className="mt-1 break-words text-base font-bold text-[var(--brand-ink)] sm:text-lg">{categoryLabel}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--brand-muted)] sm:gap-4">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDaysIcon size={16} />
                      {new Date(item.date).toLocaleDateString("en-IN")}
                    </span>
                    <span className="rounded-full bg-[var(--brand-gold)]/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-base)]">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                <div className={`text-right text-lg font-black leading-tight ${isIncome ? "text-green-600" : "text-red-500"} sm:text-xl`}>
                  {isIncome ? "+" : "-"} Rs. {item.amount.toLocaleString()}
                </div>

                <button
                  className="rounded-full border border-red-200 bg-red-50 p-3 text-red-500 transition hover:bg-red-100"
                  onClick={() => deleteItem(item.id)}
                  type="button"
                >
                  <Trash2Icon size={18} />
                </button>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
