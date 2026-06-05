"use client";

import { useState } from "react";
import {
  OPTIONAL_COLUMN_IDS,
  DEFAULT_COLUMN_VISIBILITY,
  PRODUCTS_COL_VISIBILITY_KEY,
} from "@/components/products/ProductsColumns";

const COLUMN_LABELS: Record<string, string> = {
  sku: "SKU",
  imagen: "Imagen",
  marca: "Marca",
  categoria: "Categoría",
  vencimientos: "Vencimientos",
  stock: "Stock",
};

interface ColumnSetupStepProps {
  onDone: (visibility: Record<string, boolean>) => void;
}

export function ColumnSetupStep({ onDone }: ColumnSetupStepProps) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    for (const id of OPTIONAL_COLUMN_IDS) {
      defaults[id] = DEFAULT_COLUMN_VISIBILITY[id] ?? true;
    }
    return defaults;
  });

  function toggle(id: string) {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleContinue() {
    const visibility: Record<string, boolean> = {
      producto: true,
      costo: true,
      precio: true,
      acciones: true,
      ...enabled,
    };
    try {
      localStorage.setItem(PRODUCTS_COL_VISIBILITY_KEY, JSON.stringify(visibility));
    } catch {}
    onDone(visibility);
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="heading-xl text-text-500">Configurá tus columnas</h1>
          <p className="body-md-regular text-text-400">
            Es tu primera vez agregando productos. Elegí qué columnas querés ver
            en tu tabla de inventario.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border-200 bg-white p-5">
          <p className="body-sm-semibold text-text-400">Columnas opcionales</p>
          {OPTIONAL_COLUMN_IDS.map((id) => (
            <div key={id} className="flex items-center justify-between">
              <span className="body-md-regular text-text-500">
                {COLUMN_LABELS[id] ?? id}
              </span>
              <button
                type="button"
                onClick={() => toggle(id)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  enabled[id] ? "bg-accent" : "bg-border-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    enabled[id] ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="rounded-md bg-accent px-6 py-2.5 body-md-semibold text-white transition-opacity hover:opacity-80"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
