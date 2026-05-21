"use client";
import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createBusinessWithOwnerAction } from "@/actions/superadmin";
import Button from "../shared/Button";

type FieldErrors = {
  business_name?: string[];
  currency?: string[];
  owner_name?: string[];
  owner_email?: string[];
};

export default function CreateBusinessForm() {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setSuccess(null);

    const fd = new FormData(e.currentTarget);
    const ownerEmail = fd.get("owner_email") as string;

    startTransition(async () => {
      const result = await createBusinessWithOwnerAction(fd);
      if (!result) return;
      if (result.error) {
        if (typeof result.error === "string") {
          setGeneralError(result.error);
        } else {
          setFieldErrors(result.error as FieldErrors);
        }
      } else {
        setSuccess(`Negocio creado. Invitación enviada a ${ownerEmail}.`);
        setShowForm(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="rounded-lg border border-success-200 bg-success-100 px-4 py-3">
          <p className="body-md-regular text-success-400">{success}</p>
        </div>
      )}

      {!showForm ? (
        <Button
          icon={Plus}
          onClick={() => {
            setShowForm(true);
            setSuccess(null);
          }}
        >
          Nuevo negocio
        </Button>
      ) : (
        <div className="rounded-xl border border-border-200 bg-background-400">
          <div className="flex items-center justify-between border-b border-border-200 px-6 py-4">
            <h3 className="body-md-semibold text-text-500">
              Crear nuevo negocio
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFieldErrors({});
                setGeneralError(null);
              }}
              className="text-text-400 transition-colors hover:text-text-500"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Business name */}
              <div className="flex flex-col gap-1">
                <label className="body-sm-medium text-text-400">
                  Nombre del negocio
                </label>
                <input
                  name="business_name"
                  type="text"
                  required
                  placeholder="Almacén El Sol"
                  className="rounded-lg border border-border-200 bg-background-300 px-3 py-2 body-md-regular text-text-500 placeholder:text-text-300 focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                {fieldErrors.business_name?.[0] && (
                  <p className="body-sm-regular text-danger-300">
                    {fieldErrors.business_name[0]}
                  </p>
                )}
              </div>

              {/* Currency */}
              <div className="flex flex-col gap-1">
                <label className="body-sm-medium text-text-400">
                  Moneda
                </label>
                <select
                  name="currency"
                  defaultValue="ARS"
                  className="rounded-lg border border-border-200 bg-background-300 px-3 py-2 body-md-regular text-text-500 focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="ARS">ARS — Peso argentino</option>
                  <option value="USD">USD — Dólar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="BRL">BRL — Real brasileño</option>
                </select>
              </div>

              {/* Owner name */}
              <div className="flex flex-col gap-1">
                <label className="body-sm-medium text-text-400">
                  Nombre del dueño
                </label>
                <input
                  name="owner_name"
                  type="text"
                  required
                  placeholder="María Rodríguez"
                  className="rounded-lg border border-border-200 bg-background-300 px-3 py-2 body-md-regular text-text-500 placeholder:text-text-300 focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                {fieldErrors.owner_name?.[0] && (
                  <p className="body-sm-regular text-danger-300">
                    {fieldErrors.owner_name[0]}
                  </p>
                )}
              </div>

              {/* Owner email */}
              <div className="flex flex-col gap-1">
                <label className="body-sm-medium text-text-400">
                  Email del dueño
                </label>
                <input
                  name="owner_email"
                  type="email"
                  required
                  placeholder="maria@negocio.com"
                  className="rounded-lg border border-border-200 bg-background-300 px-3 py-2 body-md-regular text-text-500 placeholder:text-text-300 focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                {fieldErrors.owner_email?.[0] && (
                  <p className="body-sm-regular text-danger-300">
                    {fieldErrors.owner_email[0]}
                  </p>
                )}
              </div>
            </div>

            {generalError && (
              <p className="mt-3 body-sm-regular text-danger-300">
                {generalError}
              </p>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-border-200 pt-4">
              <p className="body-sm-regular text-text-400">
                Se enviará una invitación al email del dueño para que configure
                su contraseña.
              </p>

              <Button type="submit" disabled={isPending}>
                {isPending ? "Creando..." : "Crear y enviar invitación"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
