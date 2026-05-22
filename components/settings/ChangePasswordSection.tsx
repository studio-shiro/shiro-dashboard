"use client";
import { useState, useTransition } from "react";
import { changePasswordAction } from "@/actions/auth";
import Button from "@/components/shared/Button";

type FieldErrors = {
  current_password?: string[];
  new_password?: string[];
  confirm_password?: string[];
};

export default function ChangePasswordSection() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await changePasswordAction(fd);
      if (!result) return;
      if (result.error) {
        if (typeof result.error === "string") {
          setGeneralError(result.error);
        } else {
          setFieldErrors(result.error as FieldErrors);
        }
      } else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <section className="rounded-xl border border-border-200 bg-background-400">
      <div className="border-b border-border-200 px-6 py-4">
        <h2 className="body-md-semibold text-text-500">
          Seguridad
        </h2>
        <p className="mt-0.5 body-sm-regular text-text-400">
          Cambiá tu contraseña de acceso
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5">
        <div className="max-w-sm space-y-4">
          <div className="flex flex-col gap-1">
            <label className="body-sm-medium text-text-400">
              Contraseña actual
            </label>
            <input
              name="current_password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-border-200 bg-background-300 px-3 py-2 body-md-regular text-text-500 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            {fieldErrors.current_password?.[0] && (
              <p className="body-sm-regular text-danger-300">
                {fieldErrors.current_password[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="body-sm-medium text-text-400">
              Nueva contraseña
            </label>
            <input
              name="new_password"
              type="password"
              required
              autoComplete="new-password"
              className="rounded-lg border border-border-200 bg-background-300 px-3 py-2 body-md-regular text-text-500 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            {fieldErrors.new_password?.[0] && (
              <p className="body-sm-regular text-danger-300">
                {fieldErrors.new_password[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="body-sm-medium text-text-400">
              Confirmá la nueva contraseña
            </label>
            <input
              name="confirm_password"
              type="password"
              required
              autoComplete="new-password"
              className="rounded-lg border border-border-200 bg-background-300 px-3 py-2 body-md-regular text-text-500 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            {fieldErrors.confirm_password?.[0] && (
              <p className="body-sm-regular text-danger-300">
                {fieldErrors.confirm_password[0]}
              </p>
            )}
          </div>

          {generalError && (
            <p className="body-sm-regular text-danger-300">{generalError}</p>
          )}

          {success && (
            <p className="body-sm-regular text-success-400">
              Contraseña actualizada correctamente.
            </p>
          )}

          <Button type="submit" size="md" disabled={isPending}>
            {isPending ? "Guardando..." : "Cambiar contraseña"}
          </Button>
        </div>
      </form>
    </section>
  );
}
