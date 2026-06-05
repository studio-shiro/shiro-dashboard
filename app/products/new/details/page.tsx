"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProductWizardStore } from "@/store/productWizard";
import type { WizardProduct } from "@/store/productWizard";
import { WizardProgressBar } from "@/components/products/wizard/WizardProgressBar";
import { WizardBottomNav } from "@/components/products/wizard/WizardBottomNav";
import { DeleteProductModal } from "@/components/products/wizard/DeleteProductModal";
import { ProductDetailsTable } from "@/components/products/wizard/ProductDetailsTable";
import { ColumnSetupStep } from "@/components/products/wizard/ColumnSetupStep";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import type { FeedbackBannerState } from "@/components/shared/FeedbackBanner";
import {
  PRODUCTS_COL_VISIBILITY_KEY,
  DEFAULT_COLUMN_VISIBILITY,
} from "@/components/products/ProductsColumns";

const PAGE_SIZE = 5;

export default function DetailsPage() {
  const router = useRouter();
  const { scannedItems, updateItem, removeItem } = useProductWizardStore();
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<WizardProduct | null>(null);
  const [banner, setBanner] = useState<FeedbackBannerState>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean> | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  // Guard
  useEffect(() => {
    if (scannedItems.length === 0) {
      router.replace("/products/new/scan");
    }
  }, [scannedItems.length, router]);

  // Read column visibility from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRODUCTS_COL_VISIBILITY_KEY);
      if (stored) {
        setColumnVisibility(JSON.parse(stored) as Record<string, boolean>);
      } else {
        setShowSetup(true);
      }
    } catch {
      setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
    }
  }, []);

  const pageCount = Math.ceil(scannedItems.length / PAGE_SIZE);
  const pageItems = scannedItems.slice(
    pageIndex * PAGE_SIZE,
    pageIndex * PAGE_SIZE + PAGE_SIZE,
  );

  function handleDelete(item: WizardProduct) {
    setDeleteTarget(item);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    removeItem(deleteTarget.barcode);
    setDeleteTarget(null);
    setBanner({ type: "success", message: "Producto eliminado correctamente." });

    if (scannedItems.length <= 1) {
      router.replace("/products/new/scan");
    } else {
      const newCount = scannedItems.length - 1;
      const maxPage = Math.ceil(newCount / PAGE_SIZE) - 1;
      if (pageIndex > maxPage) setPageIndex(maxPage);
    }
  }

  const canSubmit = scannedItems.every((p) => p.name && p.price !== null && p.price > 0);

  if (showSetup) {
    return (
      <div className="flex flex-1 flex-col gap-2.5">
        <ColumnSetupStep
          onDone={(visibility) => {
            setColumnVisibility(visibility);
            setShowSetup(false);
          }}
        />
        <WizardProgressBar steps={["complete", "complete", "current"]} />
      </div>
    );
  }

  if (!columnVisibility) return null;

  return (
    <div className="flex flex-1 flex-col gap-2.5">
      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex flex-col gap-1 pt-4">
          <h1 className="heading-xl text-text-500">Edita tu Producto Nuevo</h1>
          <p className="body-md-regular text-text-400">
            Editá la información de los nuevos productos que estás agregando a
            tu inventario.
          </p>
        </div>

        {banner && (
          <FeedbackBanner
            banner={banner}
            onClose={() => setBanner(null)}
          />
        )}

        <ProductDetailsTable
          items={pageItems}
          onUpdate={(barcode, updates) => updateItem(barcode, updates)}
          onDelete={handleDelete}
          pageIndex={pageIndex}
          pageCount={pageCount}
          onPageChange={setPageIndex}
          totalCount={scannedItems.length}
          columnVisibility={columnVisibility}
        />
      </div>

      {/* Progress + nav */}
      <WizardProgressBar steps={["complete", "complete", "current"]} />
      <WizardBottomNav
        onBack={() => router.push("/products/new/scan")}
        onNext={() => router.push("/products/new/uploading")}
        nextLabel="Subir Productos"
        nextDisabled={!canSubmit}
      />

      {deleteTarget && (
        <DeleteProductModal
          productName={deleteTarget.name || deleteTarget.barcode}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
