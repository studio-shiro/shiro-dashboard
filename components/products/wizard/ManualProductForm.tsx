"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import type { WizardProduct } from "@/store/productWizard";
import { FormInput } from "@/components/shared/FormInput";
import { DateFormInput } from "@/components/shared/DateFormInput";
import Button from "@/components/shared/Button";
import Image from "next/image";

interface ManualProductFormProps {
  columnVisibility: Record<string, boolean>;
  editTarget: WizardProduct | null;
  onAdd: (product: WizardProduct) => void;
  onUpdate: (barcode: string, updates: Partial<WizardProduct>) => void;
  onCancelEdit: () => void;
  onFilePicked: (barcode: string, file: File) => void;
}

interface FormState {
  name: string;
  reference: string;
  stock_quantity: number | null;
  brand_name: string;
  category_name: string;
  cost_price: number | null;
  price: number | null;
  lot_number: string;
  batch_barcode: string;
  manufacture_date: string | null;
  expiration_date: string | null;
}

const emptyForm: FormState = {
  name: "",
  reference: "",
  stock_quantity: null,
  brand_name: "",
  category_name: "",
  cost_price: null,
  price: null,
  lot_number: "",
  batch_barcode: "",
  manufacture_date: null,
  expiration_date: null,
};

function formFromProduct(p: WizardProduct): FormState {
  return {
    name: p.name,
    reference: p.reference,
    stock_quantity: p.stock_quantity,
    brand_name: p.brand_name ?? "",
    category_name: p.category_name ?? "",
    cost_price: p.cost_price,
    price: p.price,
    lot_number: p.lot_number ?? "",
    batch_barcode: p.batch_barcode ?? "",
    manufacture_date: p.manufacture_date,
    expiration_date: p.expiration_date,
  };
}

// ── Field config ──────────────────────────────────────────────────────────────
// Each entry maps a columnVisibility key to the input it renders.
// "image", "batches" and "actions" are intentionally absent —
// they require custom rendering that a simple type config can't express.

type TextFieldConfig = {
  type: "text";
  formKey: keyof FormState;
  label: string;
  required?: boolean;
  placeholder?: string;
};

type NumberFieldConfig = {
  type: "number";
  formKey: keyof FormState;
  label: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  step?: string;
  currency?: boolean; // true → renders CurrencyDollarIcon as adornStart
  nullable: boolean; // true → empty string maps to null; false → maps to 0
  allowZero?: boolean; // true → 0 satisfies a required field (e.g. stock)
};

type DateFieldConfig = {
  type: "date";
  formKey: keyof FormState;
  label: string;
  required?: boolean;
};

type SimpleFieldConfig = TextFieldConfig | NumberFieldConfig | DateFieldConfig;

const FIELD_CONFIG: Record<string, SimpleFieldConfig> = {
  product: {
    type: "text",
    formKey: "name",
    label: "Nombre del Producto",
    required: true,
    placeholder: "Ej: Alfajor Jorgito",
  },
  sku: {
    type: "text",
    formKey: "reference",
    label: "SKU",
    required: true,
    placeholder: "Ej: #000001",
  },
  stock: {
    type: "number",
    formKey: "stock_quantity",
    label: "Stock",
    required: true,
    min: 0,
    step: "1",
    nullable: true,
    allowZero: true,
    placeholder: "0",
  },
  brand: {
    type: "text",
    formKey: "brand_name",
    label: "Marca",
    required: true,
    placeholder: "Ej: Jorgito",
  },
  category: {
    type: "text",
    formKey: "category_name",
    label: "Categoría",
    required: true,
    placeholder: "Ej: Golosinas",
  },
  cost: {
    type: "number",
    formKey: "cost_price",
    label: "Costo Unitario",
    required: true,
    min: 0,
    step: "0.01",
    currency: true,
    nullable: true,
    placeholder: "0",
  },
  price: {
    type: "number",
    formKey: "price",
    label: "Precio Final Unitario",
    required: true,
    min: 0,
    step: "0.01",
    currency: true,
    nullable: true,
    placeholder: "0",
  },
};

// "product" sits in Row 1 alongside the image picker and is excluded from
// the auto-pair loop. The loop iterates over the remaining entries in order.
const FIELD_ORDER = [
  "product",
  "sku",
  "stock",
  "brand",
  "category",
  "cost",
  "price",
] as const;

// ── renderField ───────────────────────────────────────────────────────────────
// Pure function — receives all dependencies explicitly so it can be called
// from the rendering loop without relying on component closure state.

type SetFn = <K extends keyof FormState>(key: K, value: FormState[K]) => void;

function renderField(
  columnId: string,
  cfg: SimpleFieldConfig,
  form: FormState,
  set: SetFn,
  isEditMode: boolean,
): React.ReactNode {
  if (cfg.type === "text") {
    return (
      <FormInput
        label={cfg.label}
        required={cfg.required}
        value={form[cfg.formKey] as string}
        onChange={(v) => set(cfg.formKey as "name", v as FormState["name"])}
        placeholder={cfg.placeholder}
      />
    );
  }

  if (cfg.type === "number") {
    const raw = form[cfg.formKey] as number | null;
    const missing = cfg.allowZero ? raw === null : raw === null || raw <= 0;
    return (
      <FormInput
        label={cfg.label}
        required={cfg.required}
        type="number"
        currency={cfg.currency}
        min={cfg.min}
        step={cfg.step}
        adornStart={
          cfg.currency ? <CurrencyDollarIcon className="size-6" /> : undefined
        }
        value={raw ?? ""}
        error={Boolean(cfg.required && isEditMode && missing)}
        onChange={(v) =>
          // safe cast: formKey and the null/number transformation are always
          // co-defined in the same config entry — they can't diverge at runtime
          (set as (k: keyof FormState, val: unknown) => void)(
            cfg.formKey,
            v ? Number(v) : cfg.nullable ? null : 0,
          )
        }
        placeholder={cfg.placeholder}
      />
    );
  }

  // type === "date" — no top-level column maps to date today, but present for
  // forward compatibility (e.g. a future "fecha_ingreso" column)
  return (
    <DateFormInput
      label={cfg.label}
      required={cfg.required}
      value={form[cfg.formKey] as string | null}
      onChange={(v) =>
        (set as (k: keyof FormState, val: unknown) => void)(cfg.formKey, v)
      }
    />
  );
}

export function ManualProductForm({
  columnVisibility,
  editTarget,
  onAdd,
  onUpdate,
  onCancelEdit,
  onFilePicked,
}: ManualProductFormProps) {
  const isEditMode = editTarget !== null;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (editTarget) {
      setForm(formFromProduct(editTarget));
      setImagePreview(editTarget.image_url);
      setPendingFile(null);
    } else {
      setForm(emptyForm);
      setImagePreview(null);
      setPendingFile(null);
    }
  }, [editTarget]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageChange(file: File) {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    setImagePreview(url);
    setPendingFile(file);
  }

  function handleAdd() {
    const barcode = `manual-${crypto.randomUUID()}`;
    const product: WizardProduct = {
      barcode,
      source: "manual",
      name: form.name,
      reference: form.reference,
      image_url: imagePreview, // blob URL shows preview until real upload replaces it
      brand_id: null,
      brand_name: form.brand_name || null,
      category_id: null,
      category_name: form.category_name || null,
      description: null,
      price: form.price,
      cost_price: form.cost_price,
      stock_quantity: form.stock_quantity ?? 0,
      tracks_batches: showBatches,
      lot_number: form.lot_number || null,
      batch_barcode: form.batch_barcode || null,
      manufacture_date: form.manufacture_date,
      expiration_date: form.expiration_date,
    };
    onAdd(product);
    if (pendingFile) onFilePicked(barcode, pendingFile);
    setForm(emptyForm);
    setImagePreview(null);
    setPendingFile(null);
    // Don't revoke — the blob URL is now used as image_url in the product.
    // It will be replaced by the Supabase URL on upload, or cleaned up on unmount.
    blobUrlRef.current = null;
  }

  function handleSaveEdit() {
    if (!editTarget) return;
    const updates: Partial<WizardProduct> = {
      name: form.name,
      reference: form.reference,
      image_url: imagePreview,
      brand_name: form.brand_name || null,
      category_name: form.category_name || null,
      price: form.price,
      cost_price: form.cost_price,
      stock_quantity: form.stock_quantity ?? 0,
      tracks_batches: showBatches,
      lot_number: form.lot_number || null,
      batch_barcode: form.batch_barcode || null,
      manufacture_date: form.manufacture_date,
      expiration_date: form.expiration_date,
    };
    if (pendingFile) onFilePicked(editTarget.barcode, pendingFile);
    onUpdate(editTarget.barcode, updates);
    onCancelEdit();
  }

  // ── Visibility ──────────────────────────────────────────────────────────────
  // image and batches need custom rendering, so we keep their booleans.
  // All other simple fields are resolved dynamically via FIELD_CONFIG below.
  const showName = columnVisibility.product !== false;
  const showImage = columnVisibility.image !== false;
  const showBatches = columnVisibility.batches !== false;

  // ── canSubmit ───────────────────────────────────────────────────────────────
  // Checks every required field that is currently visible.
  const canSubmit = (FIELD_ORDER as readonly string[]).every((colId) => {
    const cfg = FIELD_CONFIG[colId];
    if (!cfg?.required) return true;
    if (columnVisibility[colId] === false) return true;
    const val = form[cfg.formKey];
    if (cfg.type === "text") return (val as string).trim() !== "";
    if (cfg.type === "number") {
      if (val === null) return false;
      return cfg.allowZero ? (val as number) >= 0 : (val as number) > 0;
    }
    return true;
  });

  // ── Auto-pairing ────────────────────────────────────────────────────────────
  // "product" is excluded — it lives in Row 1 alongside the image picker.
  const visibleSimpleFields = (FIELD_ORDER.slice(1) as string[]).filter(
    (colId) => columnVisibility[colId] !== false,
  );
  const pairedRows: string[][] = [];
  for (let i = 0; i < visibleSimpleFields.length; i += 2) {
    pairedRows.push(visibleSimpleFields.slice(i, i + 2));
  }

  return (
    <div className="flex flex-col gap-[27px] rounded-xl border border-border-300 bg-white px-[15px] py-5 shadow-lg">
      <div className="flex flex-col gap-[14px]">
        <p className="body-md-semibold text-text-500">
          Información del Producto
        </p>

        <div className="flex flex-col gap-5">
          {/* Row 1: Imagen + Nombre (special — not part of the auto-pair loop) */}
          {(showImage || showName) && (
            <div className="flex items-center gap-[18px]">
              {showImage && (
                <div className="relative mt-[9px] shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative size-16 overflow-hidden rounded-md"
                    title="Cambiar imagen"
                  >
                    {imagePreview ? (
                      <>
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={70}
                          height={70}
                          className="size-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                          <ArrowUpTrayIcon className="size-4 text-white" />
                        </div>
                      </>
                    ) : (
                      <PhotoIcon className="size-16 text-border-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-[3px] left-1/2 flex h-[22px] w-[72px] -translate-x-1/2 items-center justify-center gap-0.5 rounded-md border border-border-400 bg-white px-2 shadow-sm"
                  >
                    <ArrowUpTrayIcon className="size-3.5 shrink-0 text-text-500" />
                    <span className="body-sm-regular text-text-500">
                      Imagen
                    </span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageChange(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

              {showName && (
                <div className="min-w-0 flex-1">
                  {renderField(
                    "product",
                    FIELD_CONFIG.product,
                    form,
                    set,
                    isEditMode,
                  )}
                </div>
              )}
            </div>
          )}

          {/* Auto-paired rows — driven entirely by FIELD_CONFIG + columnVisibility */}
          {pairedRows.map((pair) => (
            <div key={pair.join("-")} className="flex gap-5">
              {pair.map((colId) => (
                <div key={colId} className="min-w-0 flex-1">
                  {renderField(
                    colId,
                    FIELD_CONFIG[colId]!,
                    form,
                    set,
                    isEditMode,
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Información del Lote ─────────────────────────────────────── */}
      {showBatches && (
        <div className="flex flex-col gap-5">
          <p className="body-md-semibold text-text-500">Información del Lote</p>

          <div className="grid grid-cols-2 gap-5">
            <FormInput
              label="Número de Lote"
              value={form.lot_number}
              onChange={(v) => set("lot_number", v)}
              placeholder="Ej: L-20230705A"
            />
            <FormInput
              label="EAN-13"
              value={form.batch_barcode}
              onChange={(v) => set("batch_barcode", v.replace(/\D/g, ""))}
              placeholder="7791234567890"
              maxLength={13}
              error={
                form.batch_barcode.length > 0 &&
                form.batch_barcode.length !== 13
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <DateFormInput
              label="Fecha de Elaboración"
              value={form.manufacture_date}
              onChange={(v) => set("manufacture_date", v)}
            />
            <DateFormInput
              label="Fecha de Vencimiento"
              value={form.expiration_date}
              onChange={(v) => set("expiration_date", v)}
            />
          </div>
        </div>
      )}

      {/* ── Action button(s) ─────────────────────────────────────────── */}
      {isEditMode ? (
        <div className="flex gap-3">
          <Button
            variant="tertiary"
            size="xs"
            onClick={onCancelEdit}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            size="xs"
            onClick={handleSaveEdit}
            disabled={!canSubmit}
            className="flex-1"
          >
            Guardar Cambios
          </Button>
        </div>
      ) : (
        <Button
          size="xs"
          onClick={handleAdd}
          disabled={!canSubmit}
          className="w-full"
        >
          Agregar Producto
        </Button>
      )}
    </div>
  );
}
