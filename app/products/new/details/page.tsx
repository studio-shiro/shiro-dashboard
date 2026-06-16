"use client";

import { useEffect, useRef, useState } from "react";
import { useFeedbackBanner } from "@/hooks/use-feedback-banner";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import { uploadFile, buildStoragePath } from "@/lib/supabase/storage";
import { useProductWizardStore } from "@/store/productWizard";
import type { WizardProduct } from "@/store/productWizard";
import { WizardProgressBar } from "@/components/products/wizard/WizardProgressBar";
import { WizardBottomNav } from "@/components/products/wizard/WizardBottomNav";
import { DeleteProductModal } from "@/components/products/wizard/DeleteProductModal";
import { ProductDetailsTable } from "@/components/products/wizard/ProductDetailsTable";
import { ManualProductForm } from "@/components/products/wizard/ManualProductForm";
import { AddedProductsPanel } from "@/components/products/wizard/AddedProductsPanel";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import { DEFAULT_COLUMN_VISIBILITY } from "@/components/products/ProductsColumns";
import { getProductColumnsAction } from "@/actions/product-columns";
import { paginateByCapacity } from "@/lib/wizard-pagination";

const PAGE_CAPACITY = 5;

export default function DetailsPage() {
  const router = useRouter();
  const {
    method,
    scannedItems,
    addItem,
    updateItem,
    removeItem,
    addEmptyItem,
  } = useProductWizardStore();
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<WizardProduct | null>(null);
  const [editTarget, setEditTarget] = useState<WizardProduct | null>(null);
  // Per Figma: the first product always starts expanded so the user
  // discovers the batch info; the rest stay collapsed until opened manually.
  const [expandedBarcodes, setExpandedBarcodes] = useState<Set<string>>(
    () => new Set(scannedItems[0] ? [scannedItems[0].barcode] : []),
  );
  const { banner, showBanner, closeBanner } = useFeedbackBanner();
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(DEFAULT_COLUMN_VISIBILITY);
  const [isUploading, setIsUploading] = useState(false);
  const pendingFiles = useRef<Map<string, File>>(new Map());

  // Guard
  useEffect(() => {
    if (method === "scan" && scannedItems.length === 0) {
      router.replace("/products/new/scan");
    } else if (method === "excel" && scannedItems.length === 0) {
      router.replace("/products/new/excel/upload");
    } else if (method !== "scan" && method !== "manual" && method !== "excel") {
      router.replace("/products/new");
    }
  }, [method, scannedItems.length, router]);

  // Load column visibility from DB on mount
  useEffect(() => {
    void getProductColumnsAction().then(setColumnVisibility);
  }, []);

  const pages = paginateByCapacity(
    scannedItems,
    expandedBarcodes,
    PAGE_CAPACITY,
  );
  const pageCount = pages.length;
  const pageItems = pages[pageIndex] ?? [];

  // Keeps pageIndex valid after anything that can shrink the page count —
  // deleting an item or collapsing rows that previously forced a split.
  useEffect(() => {
    setPageIndex((prev) => Math.min(prev, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  function toggleExpand(barcode: string) {
    setExpandedBarcodes((prev) => {
      const next = new Set(prev);
      if (next.has(barcode)) next.delete(barcode);
      else next.add(barcode);
      return next;
    });
  }

  function handleFilePicked(barcode: string, file: File) {
    pendingFiles.current.set(barcode, file);
  }

  async function handleNext() {
    if (pendingFiles.current.size > 0) {
      setIsUploading(true);
      try {
        const {
          data: { user },
        } = await createClient().auth.getUser();
        const businessId: string = user?.user_metadata?.business_id;
        for (const [barcode, file] of pendingFiles.current) {
          const path = buildStoragePath("products", businessId, barcode, file);
          const url = await uploadFile(file, "product-images", path);
          if (url) updateItem(barcode, { image_url: url });
        }
        pendingFiles.current.clear();
      } finally {
        setIsUploading(false);
      }
    }
    router.push("/products/new/uploading");
  }

  function handleDelete(item: WizardProduct) {
    setDeleteTarget(item);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    try {
      pendingFiles.current.delete(deleteTarget.barcode);
      removeItem(deleteTarget.barcode);
      // If we were editing this item, cancel edit
      if (editTarget?.barcode === deleteTarget.barcode) setEditTarget(null);
      setDeleteTarget(null);
      showBanner(
        { type: "success", message: "Producto eliminado correctamente." },
        3000,
      );
    } catch {
      setDeleteTarget(null);
      showBanner({
        type: "error",
        message: "El producto no se pudo eliminar.",
      });
    }
  }

  // All visible fields are required except image and batch/expiration fields.
  // Applies to every method (manual, scan, excel).
  const requireCol = (colId: string) => columnVisibility[colId] !== false;
  const canSubmit =
    scannedItems.length > 0 &&
    scannedItems.every(
      (p) =>
        p.name.trim() !== "" &&
        p.price !== null &&
        p.price > 0 &&
        (!requireCol("sku") || p.reference.trim() !== "") &&
        (!requireCol("brand") || Boolean(p.brand_name)) &&
        (!requireCol("category") || Boolean(p.category_name)) &&
        (!requireCol("cost") || (p.cost_price !== null && p.cost_price > 0)) &&
        (!requireCol("stock") || p.stock_quantity !== null),
    );

  // ── Manual method layout ────────────────────────────────────────────────────
  if (method === "manual") {
    const hasProducts = scannedItems.length > 0;
    const pageHeading = editTarget
      ? "Editando Producto"
      : "Agregá un Producto Manualmente";

    const formElement = (
      <ManualProductForm
        columnVisibility={columnVisibility}
        editTarget={editTarget}
        onAdd={(product) => addItem(product)}
        onUpdate={(barcode, updates) => {
          updateItem(barcode, updates);
          showBanner(
            { type: "success", message: "Producto actualizado correctamente." },
            3000,
          );
        }}
        onCancelEdit={() => setEditTarget(null)}
        onFilePicked={handleFilePicked}
      />
    );

    return (
      <div className="flex flex-1 flex-col gap-2.5">
        {/* ── No products: centered single-column ── */}
        {!hasProducts && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto">
            {/* Title is left-aligned to the form card edge (Figma) */}
            <div className="flex w-[481px] flex-col gap-1">
              <h1 className="heading-xl text-text-500">{pageHeading}</h1>
              <p className="body-md-regular text-text-400">
                Completá la información del producto para agregarlo a tu
                inventario.
              </p>
            </div>
            <div className="w-[481px]">{formElement}</div>
          </div>
        )}

        {/* ── With products: two-column layout ── */}
        {hasProducts && (
          <div className="flex flex-1 gap-9 overflow-hidden pt-4">
            {/* Left: heading + form */}
            <div className="flex w-[481px] shrink-0 flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h1 className="heading-xl text-text-500">{pageHeading}</h1>
                <p className="body-md-regular text-text-400">
                  Completá la información del producto para agregarlo a tu
                  inventario.
                </p>
              </div>
              {formElement}
            </div>

            {/* Right: self-centers vertically within the row (form determines row height) */}
            <div className="flex-1 self-center">
              <AddedProductsPanel
                items={scannedItems}
                columnVisibility={columnVisibility}
                onEdit={(item) => setEditTarget(item)}
                onUpdate={(barcode, updates) => updateItem(barcode, updates)}
                onDelete={handleDelete}
                editingBarcode={editTarget?.barcode ?? null}
              />
            </div>
          </div>
        )}

        {banner && <FeedbackBanner banner={banner} onClose={closeBanner} />}

        <WizardProgressBar steps={["complete", "current"]} />
        <WizardBottomNav
          onBack={() => router.push("/products/new")}
          onNext={() => {
            void handleNext();
          }}
          nextLabel={isUploading ? "Subiendo imágenes..." : "Subir Productos"}
          nextDisabled={!canSubmit || isUploading}
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

  // ── Scan / Excel layout ────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col gap-2.5">
      {/* Content — 24px heading→table gap */}
      <div className="flex flex-1 flex-col items-center gap-6 overflow-hidden">
        <div className="flex w-full max-w-[1600px] text-left items-start justify-start pt-4">
          <div className="flex w-full flex-col gap-1">
            <h1 className="heading-xl w-full text-text-500">
              Edita tu Producto Nuevo
            </h1>
            <p className="body-md-regular text-text-400">
              Editá la información de los nuevos productos que estás agregando a
              tu inventario.
            </p>
          </div>
        </div>

        {banner && <FeedbackBanner banner={banner} onClose={closeBanner} />}

        <ProductDetailsTable
          items={pageItems}
          onUpdate={(barcode, updates) => updateItem(barcode, updates)}
          onDelete={handleDelete}
          onFilePicked={handleFilePicked}
          expandedBarcodes={expandedBarcodes}
          onToggleExpand={toggleExpand}
          pageIndex={pageIndex}
          pageCount={pageCount}
          onPageChange={setPageIndex}
          columnVisibility={columnVisibility}
          allowBarcodeEdit={method === "excel"}
        />
      </div>

      {/* Progress + nav */}
      <WizardProgressBar
        steps={
          method === "excel"
            ? ["complete", "complete", "complete", "current"]
            : ["complete", "complete", "current"]
        }
      />
      <WizardBottomNav
        onBack={() =>
          router.push(
            method === "excel"
              ? "/products/new/excel/upload"
              : "/products/new/scan",
          )
        }
        onNext={() => {
          void handleNext();
        }}
        nextLabel={isUploading ? "Subiendo imágenes..." : "Subir Productos"}
        nextDisabled={!canSubmit || isUploading}
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
