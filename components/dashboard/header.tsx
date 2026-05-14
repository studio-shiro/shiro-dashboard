"use client";
import { useState, useTransition } from "react";
import { LogOut, User } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface HeaderProps {
  user: SupabaseUser;
}

export default function Header({ user }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => logoutAction());
  }

  return (
    <header className="h-16 shrink-0 border-b border-zinc-200 bg-white flex items-center justify-end px-6">
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center">
            <User className="h-4 w-4 text-zinc-600" />
          </div>
          <span className="hidden sm:block">{user.email}</span>
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md border border-zinc-200 shadow-lg z-20 py-1">
              <button
                onClick={handleLogout}
                disabled={pending}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
