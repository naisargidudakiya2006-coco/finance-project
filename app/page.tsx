"use client";

import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { History as HistoryIcon, House, ReceiptIndianRupee, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Expense from "./components/Expense";
import History from "./components/History";
import Home from "./components/Home";
import Salary from "./components/Salary";
import { readJson } from "@/lib/read-json";

type UserRole = "STUDENT" | "EMPLOYEE";
type TabId = "home" | "income" | "expense" | "history";
type UserPayload = { role: UserRole | null };

const SESSION_PREFIX = "spendiq:browser-session";

const TABS: Array<{
  icon: typeof House;
  id: TabId;
  label: string;
}> = [
  { id: "home", label: "Home", icon: House },
  { id: "income", label: "Hub", icon: Wallet },
  { id: "expense", label: "Expense", icon: ReceiptIndianRupee },
  { id: "history", label: "History", icon: HistoryIcon },
];

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();

  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [fetchingRole, setFetchingRole] = useState(true);
  const [savingRole, setSavingRole] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !user) {
      router.replace("/sign-in");
      return;
    }

    const sessionKey = `${SESSION_PREFIX}:${user.id}`;
    const hasFreshRedirect = searchParams.get("fresh") === "1";

    if (hasFreshRedirect) {
      sessionStorage.setItem(sessionKey, "active");
      setSessionReady(true);
      router.replace("/");
      return;
    }

    if (sessionStorage.getItem(sessionKey) === "active") {
      setSessionReady(true);
      return;
    }

    void signOut({ redirectUrl: "/sign-in" });
  }, [isLoaded, isSignedIn, router, searchParams, signOut, user]);

  useEffect(() => {
    if (!sessionReady || !isSignedIn) {
      return;
    }

    const fetchRole = async () => {
  setFetchingRole(true);
  try {
    const response = await fetch("/api/user", { cache: "no-store" });
    
    // NEW: Debugging log
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Server says: ${errorText}`);
      throw new Error("Failed to load user role");
    }

    const data = await readJson<UserPayload>(response);
    setRole(data.role ?? null);
  } catch (error) {
    console.error("Failed to load user role", error);
  } finally {
    setFetchingRole(false);
  }
};
    void fetchRole();
  }, [isSignedIn, sessionReady]);

  const handleRoleSelection = async (selectedRole: UserRole) => {
    try {
      setSavingRole(true);

      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to save role");
      }

      await readJson<UserPayload>(response);
      setRole(selectedRole);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      console.error("Role selection failed", error);
    } finally {
      setSavingRole(false);
    }
  };

  if (!isLoaded || !sessionReady || fetchingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-shell)]">
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-white/70 bg-white/85 px-8 py-10 shadow-[0_30px_80px_rgba(74,21,75,0.18)] backdrop-blur">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-base)] border-t-transparent" />
          <p className="text-sm font-semibold tracking-[0.2em] text-[var(--brand-base)] uppercase">
            Loading SpendIQ
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return null;
  }

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-shell)] px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_35px_80px_rgba(74,21,75,0.18)] backdrop-blur">
          <div className="mb-6 inline-flex rounded-2xl bg-[linear-gradient(135deg,var(--brand-base),var(--brand-magenta),var(--brand-orange))] px-4 py-3 text-sm font-black tracking-[0.25em] text-white uppercase shadow-[0_18px_40px_rgba(193,53,132,0.28)]">
            First Login
          </div>
          <h1 className="text-3xl font-black text-[var(--brand-ink)]">Choose your profile</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--brand-muted)]">
            We only ask this once. It decides whether your money page becomes Pocketmoney Hub or Salary Hub.
          </p>

          <div className="mt-8 grid gap-4">
            <button
              className="rounded-[1.75rem] border border-[var(--brand-gold)]/70 bg-[var(--brand-gold)]/20 p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--brand-magenta)] hover:shadow-[0_20px_45px_rgba(245,96,64,0.2)]"
              disabled={savingRole}
              onClick={() => handleRoleSelection("STUDENT")}
            >
              <span className="text-xs font-black tracking-[0.25em] text-[var(--brand-base)] uppercase">Student</span>
              <p className="mt-2 text-lg font-bold text-[var(--brand-ink)]">Pocketmoney Hub</p>
              <p className="mt-1 text-sm text-[var(--brand-muted)]">Perfect for allowances, pocket money, and daily expense tracking.</p>
            </button>

            <button
              className="rounded-[1.75rem] border border-[var(--brand-magenta)]/25 bg-[linear-gradient(180deg,rgba(193,53,132,0.08),rgba(74,21,75,0.06))] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--brand-orange)] hover:shadow-[0_20px_45px_rgba(193,53,132,0.2)]"
              disabled={savingRole}
              onClick={() => handleRoleSelection("EMPLOYEE")}
            >
              <span className="text-xs font-black tracking-[0.25em] text-[var(--brand-magenta)] uppercase">Employee</span>
              <p className="mt-2 text-lg font-bold text-[var(--brand-ink)]">Salary Hub</p>
              <p className="mt-1 text-sm text-[var(--brand-muted)]">Best for salary entries, pay cycles, and monthly spend control.</p>
            </button>
          </div>

          {savingRole ? <p className="mt-5 text-sm font-semibold text-[var(--brand-base)]">Saving your profile...</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--app-shell)] pb-32">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black tracking-[0.3em] text-[var(--brand-magenta)] uppercase">SpendIQ</p>
            <h1 className="mt-1 text-2xl font-black text-[var(--brand-ink)]">
              {role === "STUDENT" ? "Pocketmoney Planner" : "Salary Planner"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[var(--brand-gold)]/35 px-4 py-2 text-xs font-black tracking-[0.18em] text-[var(--brand-base)] uppercase">
              {role === "STUDENT" ? "Student" : "Employee"}
            </div>
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "h-11 w-11 shadow-[0_12px_30px_rgba(74,21,75,0.18)]",
                },
              }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        {activeTab === "home" ? <Home refreshKey={refreshKey} role={role} /> : null}
        {activeTab === "income" ? <Salary onSaved={() => setRefreshKey((current) => current + 1)} refreshKey={refreshKey} role={role} /> : null}
        {activeTab === "expense" ? <Expense onSaved={() => setRefreshKey((current) => current + 1)} /> : null}
        {activeTab === "history" ? <History onDeleted={() => setRefreshKey((current) => current + 1)} refreshKey={refreshKey} role={role} /> : null}
      </main>

      <nav className="fixed bottom-5 left-1/2 z-50 flex w-[min(92vw,36rem)] -translate-x-1/2 items-center justify-between rounded-full border border-white/70 bg-[var(--brand-base)] px-3 py-3 shadow-[0_35px_70px_rgba(74,21,75,0.35)]">
        {TABS.map(({ icon: Icon, id, label }) => {
          const isActive = activeTab === id;
          const resolvedLabel = id === "income" ? (role === "STUDENT" ? "Pocket" : "Salary") : label;

          return (
            <button
              key={id}
              className={`flex min-w-[4.5rem] flex-col items-center gap-1 rounded-full px-4 py-2 text-xs font-bold transition ${
                isActive
                  ? "bg-white text-[var(--brand-base)] shadow-[0_12px_25px_rgba(255,255,255,0.22)]"
                  : "text-white/72 hover:text-white"
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={20} />
              <span>{resolvedLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
