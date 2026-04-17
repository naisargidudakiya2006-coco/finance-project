"use client";

import { useState } from "react";

type UserRole = "STUDENT" | "EMPLOYEE";

export default function Account({
  onRoleUpdated,
  role,
}: {
  onRoleUpdated: (role: UserRole) => Promise<void>;
  role: UserRole;
}) {
  const [loading, setLoading] = useState(false);
  const nextRole = role === "STUDENT" ? "EMPLOYEE" : "STUDENT";

  const handleSwitch = async () => {
    try {
      setLoading(true);
      await onRoleUpdated(nextRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[1.6rem] border border-white/70 bg-white/88 p-5 shadow-[0_25px_60px_rgba(74,21,75,0.12)] sm:rounded-[2rem] sm:p-8">
        <p className="text-xs font-black tracking-[0.22em] text-[var(--brand-base)] uppercase">Manage Account</p>
        <h2 className="mt-2 text-2xl font-black text-[var(--brand-ink)] sm:text-3xl">Profile Settings</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
          Use Clerk from the profile menu for password and security changes. Use this section to switch your finance profile type.
        </p>

        <div className="mt-6 rounded-[1.4rem] border border-[var(--brand-magenta)]/15 bg-[var(--brand-gold)]/10 p-4 sm:p-5">
          <p className="text-xs font-black tracking-[0.2em] text-[var(--brand-magenta)] uppercase">Current Profile</p>
          <h3 className="mt-2 text-2xl font-black text-[var(--brand-ink)]">
            {role === "STUDENT" ? "Student" : "Employee"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
            {role === "STUDENT"
              ? "Your money page currently works as Pocketmoney Hub."
              : "Your money page currently works as Salary Hub."}
          </p>
        </div>

        <button
          className="mt-6 w-full rounded-[1.2rem] bg-[linear-gradient(135deg,var(--brand-base),var(--brand-magenta),var(--brand-orange))] px-4 py-4 text-sm font-black tracking-[0.18em] text-white uppercase shadow-[0_22px_45px_rgba(193,53,132,0.24)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-[1.4rem]"
          disabled={loading}
          onClick={handleSwitch}
          type="button"
        >
          {loading
            ? "Updating..."
            : `Change Profile to ${nextRole === "STUDENT" ? "Student" : "Employee"}`}
        </button>
      </div>
    </div>
  );
}
