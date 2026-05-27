"use client";
import { useTransition, useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/actions/auth";
import Button from "@/components/shared/Button";

export default function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await forgotPasswordAction(formData);
      const err = (result as { error?: unknown }).error;
      if (err) {
        const msg =
          typeof err === "string"
            ? err
            : Object.values(err as Record<string, string[]>).flat().join(", ");
        setError(msg);
        return;
      }
      setSent(true);
    });
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Shiro Studio</h1>
        <p className="mt-1 text-sm text-zinc-500">Recuperá el acceso a tu cuenta</p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-700 text-center">
            Revisá tu correo — te enviamos un link para recuperar tu contraseña.
          </p>
          <Link
            href="/login"
            className="block text-center text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" size="md" disabled={pending} className="w-full">
            {pending ? "Enviando…" : "Enviar link de recuperación"}
          </Button>

          <Link
            href="/login"
            className="block text-center text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            Volver al inicio de sesión
          </Link>
        </form>
      )}
    </div>
  );
}
