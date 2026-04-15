import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <div className="flex items-center justify-end">
      <UserButton afterSignOutUrl="/sign-in" />
    </div>
  );
}
