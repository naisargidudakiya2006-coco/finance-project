"use client";

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-shell)] px-4 py-10">
      <SignUp forceRedirectUrl="/?fresh=1" signInUrl="/sign-in" />
    </div>
  );
}
