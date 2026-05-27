"use client";

import { useState, useMemo, useEffect } from "react";
import type { ProductTableRow } from "@/types/database";
import { exportProductsToExcel } from "@/lib/exportProducts";
import { ProductsPageHeader } from "./ProductsPageHeader";
import {
  FeedbackBanner,
  type FeedbackBannerState,
} from "@/components/shared/FeedbackBanner";
import {
  ProductsTable,
  DEFAULT_COLUMN_VISIBILITY,
  FIXED_COLUMN_IDS,
} from "./ProductsTable";

const LOCALSTORAGE_KEY = "shiro-products-col-visibility";

interface ProductsViewProps {
  products: ProductTableRow[];
}

export function ProductsView({ products }: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [banner, setBanner] = useState<FeedbackBannerState>(null);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(DEFAULT_COLUMN_VISIBILITY);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load persisted column visibility from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALSTORAGE_KEY);
      if (stored)
        setColumnVisibility(JSON.parse(stored) as Record<string, boolean>);
    } catch {}
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.reference.toLowerCase().includes(term) ||
        String(p.price).includes(term) ||
        (p.cost_price !== null && String(p.cost_price).includes(term)),
    );
  }, [products, searchTerm]);

  const isEmpty = products.length === 0;

  function handleColumnVisibilityChange(next: Record<string, boolean>) {
    // Fixed columns always remain visible
    const safe = { ...next };
    FIXED_COLUMN_IDS.forEach((id) => {
      safe[id] = true;
    });
    setColumnVisibility(safe);
    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(safe));
    } catch {}
  }

  const showSuccessBanner = (message: string) =>
    setBanner({ type: "success", message });

  const showErrorBanner = (message: string) =>
    setBanner({ type: "error", message });
  const closeBanner = () => setBanner(null);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      exportProductsToExcel(filteredProducts, columnVisibility);
      showSuccessBanner("Documento descargado correctamente");
    } catch {
      showErrorBanner(
        "El documento no se descargó correctamente. Vuelva a intentar nuevamente.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <ProductsPageHeader
        productCount={products.length}
        isEmpty={isEmpty}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />

      {banner && <FeedbackBanner banner={banner} onClose={closeBanner} />}

      <ProductsTable
        products={filteredProducts}
        originalCount={products.length}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onActionError={showErrorBanner}
      />
    </div>
  );
}
