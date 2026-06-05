"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BarcodeSource } from "@/types/barcode";

export interface WizardProduct {
  barcode: string;
  source: BarcodeSource;
  name: string;
  reference: string;
  image_url: string | null;
  brand_id: string | null;
  brand_name: string | null;
  category_id: string | null;
  category_name: string | null;
  description: string | null;
  price: number | null;
  cost_price: number | null;
  stock_quantity: number;
  tracks_batches: boolean;
  lot_number: string | null;
  batch_barcode: string | null;
  manufacture_date: string | null;
  expiration_date: string | null;
}

interface ProductWizardState {
  method: "scan" | "manual" | "excel" | null;
  scannedItems: WizardProduct[];
  setMethod: (method: "scan" | "manual" | "excel") => void;
  addItem: (item: WizardProduct) => void;
  removeItem: (barcode: string) => void;
  updateItem: (barcode: string, updates: Partial<WizardProduct>) => void;
  reset: () => void;
}

export const useProductWizardStore = create<ProductWizardState>()(
  persist(
    (set) => ({
      method: null,
      scannedItems: [],

      setMethod: (method) => set({ method }),

      addItem: (item) =>
        set((state) => ({ scannedItems: [...state.scannedItems, item] })),

      removeItem: (barcode) =>
        set((state) => ({
          scannedItems: state.scannedItems.filter(
            (item) => item.barcode !== barcode,
          ),
        })),

      updateItem: (barcode, updates) =>
        set((state) => ({
          scannedItems: state.scannedItems.map((item) =>
            item.barcode === barcode ? { ...item, ...updates } : item,
          ),
        })),

      reset: () => set({ method: null, scannedItems: [] }),
    }),
    {
      name: "shiro-product-wizard",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
