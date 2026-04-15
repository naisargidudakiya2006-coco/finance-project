"use client";

import { useEffect, useMemo, useState } from "react";

import { readJson } from "@/lib/read-json";

type UserRole = "STUDENT" | "EMPLOYEE";

type Transaction = {
  amount: number;
  type: "expense" | "salary" | "pocketmoney";
};

export default function Salary({
  onSaved,
  refreshKey,
  role,
}: {
  onSaved: () => void;
  refreshKey: number;
  role: UserRole;
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/transactions", { cache: "no-store" });
        const data = await readJson<Array<{ amount: number; type: Transaction["type"] }>>(response);

        if (!response.ok || !Array.isArray(data)) {
          throw new Error("Failed to load transactions");
        }

        setTransactions(
          data.map((transaction) => ({
            amount: Number(transaction.amount),
            type: transaction.type,
          }))
        );
      } catch (loadError) {
        console.error("Failed to load transactions", loadError);
        setError("Unable to load your current balance.");
      } finally {
        setLoading(false);
      }
    };

    void loadTransactions();
  }, [refreshKey]);

  const incomeType = role === "STUDENT" ? "pocketmoney" : "salary";
  const heading = role === "STUDENT" ? "Pocketmoney Hub" : "Salary Hub";
  const actionLabel = role === "STUDENT" ? "Pocket Money" : "Salary";

  const balance = useMemo(() => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === "expense") {
        return total - transaction.amount;
      }

      if (transaction.type === incomeType) {
        return total + transaction.amount;
      }

      return total;
    }, 0);
  }, [incomeType, transactions]);

  const saveIncome = async () => {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
          date,
          name: actionLabel,
          type: incomeType,
        }),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      await readJson<{ id: string }>(response);
      setAmount("");
      setSuccess(`${actionLabel} saved successfully.`);
      onSaved();
    } catch (saveError) {
      console.error("Failed to save income", saveError);
      setError(`Unable to save ${actionLabel.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_25px_60px_rgba(74,21,75,0.12)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-magenta)] uppercase">{role === "STUDENT" ? "Student Mode" : "Employee Mode"}</p>
            <h2 className="mt-2 text-3xl font-black text-[var(--brand-ink)]">{heading}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--brand-muted)]">
              Record each {actionLabel.toLowerCase()} entry here so your balance and nudges stay accurate.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,var(--brand-base),var(--brand-magenta),var(--brand-orange))] px-5 py-4 text-white shadow-[0_24px_45px_rgba(74,21,75,0.22)]">
            <p className="text-xs font-black tracking-[0.2em] uppercase text-white/75">Available Balance</p>
            <p className="mt-2 text-2xl font-black">{loading ? "Loading..." : `Rs. ${balance.toLocaleString()}`}</p>
          </div>
        </div>

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
        </div>

        <button
          className="mt-6 w-full rounded-[1.4rem] bg-[linear-gradient(135deg,var(--brand-base),var(--brand-magenta),var(--brand-orange))] px-4 py-4 text-sm font-black tracking-[0.18em] text-white uppercase shadow-[0_22px_45px_rgba(193,53,132,0.24)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving}
          onClick={saveIncome}
        >
          {saving ? "Saving..." : `Add ${actionLabel}`}
        </button>

        {success ? <p className="mt-4 text-sm font-semibold text-green-600">{success}</p> : null}
        {error ? <p className="mt-4 text-sm font-semibold text-red-500">{error}</p> : null}
      </div>
    </div>
  );
}
