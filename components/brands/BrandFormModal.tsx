"use client";

import { useState, useRef, useTransition } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import { createBrandAction, updateBrandAction } from "@/actions/brands";
import Button from "@/components/shared/Button";
import type { BrandTableRow } from "@/types/database";

interface BrandFormModalProps {
  brand?: BrandTableRow | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

async function uploadLogo(
  file: File,
  businessId: string,
  uniqueId: string,
): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `brands/${businessId}/${uniqueId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("logos")
    .upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from("logos").getPublicUrl(path);
  return data.publicUrl;
}

export function BrandFormModal({
  brand,
  onClose,
  onSuccess,
  onError,
}: BrandFormModalProps) {
  const isEditing = !!brand;
  const [name, setName] = useState(brand?.name ?? "");
  const [description, setDescription] = useState(brand?.description ?? "");
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(
    brand?.logo_url ?? null,
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    brand?.logo_url ?? null,
  );
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveLogo() {
    setLogoFile(null);
    setCurrentLogoUrl(null);
    setLogoPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      let finalLogoUrl: string | null = currentLogoUrl;

      if (logoFile) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          onError("Sesión expirada. Recargá la página.");
          return;
        }
        const businessId = user.user_metadata.business_id as string;
        const uniqueId = brand?.id ?? crypto.randomUUID();
        const uploaded = await uploadLogo(logoFile, businessId, uniqueId);
        if (!uploaded) {
          onError("No se pudo subir el logo. Intentá nuevamente.");
          return;
        }
        finalLogoUrl = uploaded;
      }

      const formData = new FormData();
      formData.set("name", name.trim());
      if (description.trim()) formData.set("description", description.trim());
      if (finalLogoUrl) formData.set("logo_url", finalLogoUrl);

      if (isEditing) {
        formData.set("id", brand.id);
        const result = await updateBrandAction(formData);
        if (result.error) {
          onError(
            typeof result.error === "string"
              ? result.error
              : "Error al actualizar la marca.",
          );
          return;
        }
        onSuccess("Marca actualizada correctamente.");
      } else {
        const result = await createBrandAction(formData);
        if (result.error) {
          onError(
            typeof result.error === "string"
              ? result.error
              : "Error al crear la marca.",
          );
          return;
        }
        onSuccess("Marca creada correctamente.");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-border-100 bg-background-400 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="heading-xl text-text-500">
            {isEditing ? "Editar Marca" : "Nueva Marca"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-400 transition-colors hover:text-text-500"
            aria-label="Cerrar"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Logo */}
          <div className="flex flex-col gap-2">
            <label className="body-sm-medium text-text-500">Logo</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-100 bg-background-300 transition-colors hover:bg-background-200"
              >
                {logoPreviewUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logoPreviewUrl}
                    alt="Logo preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PhotoIcon className="size-6 text-text-300" />
                )}
              </button>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-border-100 px-3 py-1.5 body-sm-semibold text-text-500 transition-colors hover:bg-background-300"
                >
                  {logoPreviewUrl ? "Cambiar logo" : "Subir logo"}
                </button>
                {logoPreviewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-left body-sm-regular text-text-400 transition-colors hover:text-red-500"
                  >
                    Eliminar logo
                  </button>
                )}
                <p className="body-xs-regular text-text-300">
                  JPG, PNG, SVG. Máx 2 MB
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="brand-name" className="body-sm-medium text-text-500">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="brand-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Adidas"
              required
              className="w-full rounded-lg border border-border-100 bg-background-400 px-3 py-2.5 body-md-regular text-text-500 outline-none placeholder:text-text-300 transition-colors focus:border-accent-hover"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="brand-description"
              className="body-sm-medium text-text-500"
            >
              Descripción
            </label>
            <textarea
              id="brand-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional de la marca"
              rows={3}
              className="w-full resize-none rounded-lg border border-border-100 bg-background-400 px-3 py-2.5 body-md-regular text-text-500 outline-none placeholder:text-text-300 transition-colors focus:border-accent-hover"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="tertiary"
              size="md"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isPending || !name.trim()}
            >
              {isPending
                ? "Guardando…"
                : isEditing
                  ? "Guardar Cambios"
                  : "Crear Marca"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
