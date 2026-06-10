"use client";

import { useState, useMemo, useTransition } from "react";
import type { ProductTableRow } from "@/types/database";
import { exportProductsToExcel } from "@/lib/exportProducts";
import { ProductsPageHeader } from "./ProductsPageHeader";
import {
  FeedbackBanner,
  type FeedbackBannerState,
} from "@/components/shared/FeedbackBanner";
import {
  ProductsTable,
  FIXED_COLUMN_IDS,
} from "./ProductsTable";
import { saveProductColumnsAction } from "@/actions/product-columns";

interface ProductsViewProps {
  products: ProductTableRow[];
  createdCount?: number;
  uploadError?: boolean;
  initialColumnVisibility: Record<string, boolean>;
}

export function ProductsView({ products, createdCount, uploadError, initialColumnVisibility }: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [banner, setBanner] = useState<FeedbackBannerState>(() => {
    if (createdCount !== undefined) {
      return {
        type: "success",
        message: `${createdCount === 1 ? "Producto registrado" : `${createdCount} productos registrados`} correctamente.`,
      };
    }
    if (uploadError) {
      return {
        type: "error",
        message: "No se pudieron guardar los productos. Intentá nuevamente.",
      };
    }
    return null;
  });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumnVisibility);
  const [isDownloading, setIsDownloading] = useState(false);
  const [, startTransition] = useTransition();

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
    const safe = { ...next };
    FIXED_COLUMN_IDS.forEach((id) => { safe[id] = true; });
    setColumnVisibility(safe);
    const enabledKeys = Object.entries(safe).filter(([, v]) => v).map(([k]) => k);
    startTransition(() => { void saveProductColumnsAction(enabledKeys); });
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
