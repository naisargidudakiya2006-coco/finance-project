"use client";

import { useState } from "react";

type AppreciationType = "investments" | "savings";

const CATEGORIES = [
  "Food",
  "Travel",
  "Bills-(Grocery)",
  "Shopping-(Selfcare)",
  "Savings",
  "Investments",
  "Other",
];

export default function Expense({ onSaved }: { onSaved: () => void }) {
  const [amount, setAmount] = useState("");
  const [appreciationType, setAppreciationType] = useState<AppreciationType | null>(null);
  const [category, setCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const finalCategoryName = category === "Other" ? customCategory.trim() : category;
  const isValid = Number(amount) > 0 && Boolean(date) && (category !== "Other" || customCategory.trim() !== "");

  const addExpense = async () => {
    if (!isValid) {
      setError("Fill in a valid amount, date, and category.");
      return;
    }

    setLoading(true);
    setError("");
    setAppreciationType(null);
    setSuccess("");

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          date,
          name: finalCategoryName,
          source: "general",
          type: "expense",
        }),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setAmount("");
      setCategory("Food");
      setCustomCategory("");
      setSuccess("Expense saved successfully.");

      const normalizedCategory = finalCategoryName.toLowerCase();
      if (normalizedCategory === "savings") {
        setAppreciationType("savings");
      } else if (normalizedCategory === "investments") {
        setAppreciationType("investments");
      }

      onSaved();
    } catch (saveError) {
      console.error("Failed to save expense", saveError);
      setError("Failed to save expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {appreciationType ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(26,29,35,0.45)] p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-[1.7rem] border border-white/70 bg-white p-5 shadow-[0_35px_80px_rgba(74,21,75,0.22)] sm:p-6">
            <p
              className={`text-xs font-black tracking-[0.22em] uppercase ${
                appreciationType === "savings" ? "text-[var(--brand-base)]" : "text-[var(--brand-magenta)]"
              }`}
            >
              {appreciationType === "savings" ? "Savings appreciation" : "Investment appreciation"}
            </p>
            <h3 className="mt-2 text-2xl font-black text-[var(--brand-ink)]">
              {appreciationType === "savings" ? "Nice save" : "Future move unlocked"}
            </h3>

            <div className="mt-4 space-y-4 text-sm leading-6 text-[var(--brand-muted)]">
              <div>
                <p className="text-xs font-black tracking-[0.2em] text-[var(--brand-base)] uppercase">Appreciation</p>
                <p className="mt-1">
                  {appreciationType === "savings"
                    ? "You recorded money for savings right away. That habit builds real stability over time."
                    : "You invested money for your future. Small, steady investment entries can turn into strong long-term progress."}
                </p>
              </div>

              <div>
                <p className="text-xs font-black tracking-[0.2em] text-[var(--brand-base)] uppercase">Keep this streak</p>
                <p className="mt-1">
                  {appreciationType === "savings"
                    ? "Keep carving out a part of your balance first before the next spend."
                    : "Keep treating investments as a planned move, not leftover money after spending."}
                </p>
              </div>
            </div>

            <button
              className="mt-5 w-full rounded-[1.2rem] bg-[linear-gradient(135deg,var(--brand-orange),var(--brand-magenta),var(--brand-base))] px-4 py-3 text-sm font-black tracking-[0.16em] text-white uppercase"
              onClick={() => setAppreciationType(null)}
              type="button"
            >
              Keep Going
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-[1.6rem] border border-white/70 bg-white/88 p-5 shadow-[0_25px_60px_rgba(74,21,75,0.12)] sm:rounded-[2rem] sm:p-8">
        <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-orange)] uppercase">Expense Tracker</p>
        <h2 className="mt-2 text-2xl font-black text-[var(--brand-ink)] sm:text-3xl">Add Expense</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">Every expense is stored with its category, date, and amount so your history stays accurate.</p>

        <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">Amount</span>
            <input
              className="min-h-12 rounded-[1.1rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-3 text-base font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white sm:rounded-[1.25rem] sm:py-4"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              type="number"
              value={amount}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">Date</span>
            <input
              className="min-h-12 rounded-[1.1rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-3 text-base font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white sm:rounded-[1.25rem] sm:py-4"
              onChange={(event) => setDate(event.target.value)}
              type="date"
              value={date}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">Category</span>
            <select
              className="min-h-12 rounded-[1.1rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-3 text-base font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white sm:rounded-[1.25rem] sm:py-4"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {category === "Other" ? (
            <label className="grid gap-2">
              <span className="text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">Custom Category</span>
              <input
                className="min-h-12 rounded-[1.1rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-3 text-base font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white sm:rounded-[1.25rem] sm:py-4"
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="Type your category"
                type="text"
                value={customCategory}
              />
            </label>
          ) : null}
        </div>

        <button
          className="mt-5 w-full rounded-[1.2rem] bg-[linear-gradient(135deg,var(--brand-orange),var(--brand-magenta),var(--brand-base))] px-4 py-4 text-sm font-black tracking-[0.18em] text-white uppercase shadow-[0_22px_45px_rgba(245,96,64,0.25)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6 sm:rounded-[1.4rem]"
          disabled={!isValid || loading}
          onClick={addExpense}
        >
          {loading ? "Saving..." : "Add Expense"}
        </button>

        {success ? <p className="mt-4 text-sm font-semibold text-green-600">{success}</p> : null}
        {error ? <p className="mt-4 text-sm font-semibold text-red-500">{error}</p> : null}
      </div>
    </div>
  );
}
