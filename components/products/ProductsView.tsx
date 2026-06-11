"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import type { ProductTableRow } from "@/types/database";
import { exportProductsToExcel } from "@/lib/exportProducts";
import { ProductsPageHeader } from "./ProductsPageHeader";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import {
  ProductsTable,
  FIXED_COLUMN_IDS,
} from "./ProductsTable";
import { saveProductColumnsAction } from "@/actions/product-columns";
import { useFeedbackBanner } from "@/hooks/use-feedback-banner";

interface ProductsViewProps {
  products: ProductTableRow[];
  createdCount?: number;
  uploadError?: boolean;
  initialColumnVisibility: Record<string, boolean>;
}

export function ProductsView({ products, createdCount, uploadError, initialColumnVisibility }: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { banner, showBanner, closeBanner } = useFeedbackBanner();
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumnVisibility);
  const [isDownloading, setIsDownloading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (createdCount !== undefined) {
      showBanner(
        {
          type: "success",
          message:
            createdCount === 1
              ? "Producto agregado correctamente."
              : "Productos agregados correctamente.",
        },
        3000,
      );
    } else if (uploadError) {
      showBanner({
        type: "error",
        message: "No se pudieron guardar los productos. Intentá nuevamente.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const safe = { ...next };
    FIXED_COLUMN_IDS.forEach((id) => { safe[id] = true; });
    setColumnVisibility(safe);
    const enabledKeys = Object.entries(safe).filter(([, v]) => v).map(([k]) => k);
    startTransition(() => { void saveProductColumnsAction(enabledKeys); });
  }

  async function handleDownload() {
    setIsDownloading(true);
    try {
      exportProductsToExcel(filteredProducts, columnVisibility);
      showBanner({ type: "success", message: "Documento descargado correctamente" }, 3000);
    } catch {
      showBanner({
        type: "error",
        message: "El documento no se descargó correctamente. Vuelva a intentar nuevamente.",
      });
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
        onActionError={(msg) => showBanner({ type: "error", message: msg })}
      />
    </div>
  );
}
