"use client";

import { useState } from "react";

const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Other"];

export default function Expense({ onSaved }: { onSaved: () => void }) {
  const [amount, setAmount] = useState("");
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
      <div className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_25px_60px_rgba(74,21,75,0.12)] sm:p-8">
        <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-orange)] uppercase">Expense Tracker</p>
        <h2 className="mt-2 text-3xl font-black text-[var(--brand-ink)]">Add Expense</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">Every expense is stored with its category, date, and amount so your history stays accurate.</p>

        <div className="mt-8 grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">Amount</span>
            <input
              className="rounded-[1.25rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-4 text-base font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              type="number"
              value={amount}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">Date</span>
            <input
              className="rounded-[1.25rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-4 text-base font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white"
              onChange={(event) => setDate(event.target.value)}
              type="date"
              value={date}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">Category</span>
            <select
              className="rounded-[1.25rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-4 text-base font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white"
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
                className="rounded-[1.25rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/8 px-4 py-4 text-base font-semibold text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-magenta)] focus:bg-white"
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="Type your category"
                type="text"
                value={customCategory}
              />
            </label>
          ) : null}
        </div>

        <button
          className="mt-6 w-full rounded-[1.4rem] bg-[linear-gradient(135deg,var(--brand-orange),var(--brand-magenta),var(--brand-base))] px-4 py-4 text-sm font-black tracking-[0.18em] text-white uppercase shadow-[0_22px_45px_rgba(245,96,64,0.25)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
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
