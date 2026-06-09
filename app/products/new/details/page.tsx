"use client";

import { useEffect, useRef, useState } from "react";
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
import { ColumnSetupStep } from "@/components/products/wizard/ColumnSetupStep";
import { ManualProductForm } from "@/components/products/wizard/ManualProductForm";
import { AddedProductsPanel } from "@/components/products/wizard/AddedProductsPanel";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import type { FeedbackBannerState } from "@/components/shared/FeedbackBanner";
import {
  PRODUCTS_COL_VISIBILITY_KEY,
  DEFAULT_COLUMN_VISIBILITY,
} from "@/components/products/ProductsColumns";

const PAGE_SIZE = 5;

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
  const [banner, setBanner] = useState<FeedbackBannerState>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<
    string,
    boolean
  > | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const pendingFiles = useRef<Map<string, File>>(new Map());
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Read column visibility from localStorage (all methods)
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

  // Cleanup banner timer on unmount
  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, []);

  function showBanner(b: NonNullable<FeedbackBannerState>) {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setBanner(b);
    bannerTimerRef.current = setTimeout(() => setBanner(null), 2000);
  }

  const pageCount = Math.ceil(scannedItems.length / PAGE_SIZE);
  const pageItems = scannedItems.slice(
    pageIndex * PAGE_SIZE,
    pageIndex * PAGE_SIZE + PAGE_SIZE,
  );

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
      showBanner({
        type: "success",
        message: "Producto eliminado correctamente.",
      });

      // Scan/excel: fix pagination
      if (method !== "manual") {
        const newCount = scannedItems.length - 1;
        const maxPage = Math.ceil(newCount / PAGE_SIZE) - 1;
        if (pageIndex > maxPage) setPageIndex(Math.max(0, maxPage));
      }
    } catch {
      setDeleteTarget(null);
      showBanner({
        type: "error",
        message: "El producto no se pudo eliminar.",
      });
    }
  }

  const canSubmit =
    scannedItems.length > 0 &&
    scannedItems.every((p) => p.name && p.price !== null && p.price > 0);

  // ── Column setup (all methods) ──────────────────────────────────────────────
  if (showSetup) {
    return (
      <div className="flex flex-1 flex-col gap-2.5">
        <ColumnSetupStep
          onDone={(visibility) => {
            setColumnVisibility(visibility);
            setShowSetup(false);
          }}
        />
        <WizardProgressBar
          steps={
            method === "manual"
              ? ["complete", "current"]
              : method === "excel"
                ? ["complete", "complete", "complete", "current"]
                : ["complete", "complete", "current"]
          }
        />
      </div>
    );
  }

  if (!columnVisibility) return null;

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
          showBanner({
            type: "success",
            message: "Producto actualizado correctamente.",
          });
        }}
        onCancelEdit={() => setEditTarget(null)}
        onFilePicked={handleFilePicked}
      />
    );

    return (
      <div className="flex flex-1 flex-col gap-2.5">
        {/* ── No products: centered single-column ── */}
        {!hasProducts && (
          <div className="flex flex-1 flex-col items-center gap-8 overflow-y-auto pt-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="heading-xl text-text-500">{pageHeading}</h1>
              <p className="body-md-regular max-w-sm text-text-400">
                Completá la información del producto para agregarlo a tu
                inventario.
              </p>
            </div>
            <div className="w-120">{formElement}</div>
          </div>
        )}

        {/* ── With products: two-column layout ── */}
        {hasProducts && (
          <div className="flex flex-1 gap-[27px] overflow-hidden pt-4">
            {/* Left: heading + form */}
            <div className="flex w-120 shrink-0 flex-col gap-4 overflow-y-auto">
              <h1 className="heading-xl text-text-500">{pageHeading}</h1>
              {formElement}
            </div>

            {/* Right: added products panel */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <AddedProductsPanel
                items={scannedItems}
                columnVisibility={columnVisibility}
                banner={banner}
                onBannerClose={() => setBanner(null)}
                onEdit={(item) => setEditTarget(item)}
                onDelete={handleDelete}
                editingBarcode={editTarget?.barcode ?? null}
              />
            </div>
          </div>
        )}

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
      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex items-end justify-between pt-4">
          <div className="flex flex-col gap-1">
            <h1 className="heading-xl text-text-500">
              Edita tu Producto Nuevo
            </h1>
            <p className="body-md-regular text-text-400">
              Editá la información de los nuevos productos que estás agregando a
              tu inventario.
            </p>
          </div>
          {method === "scan" && (
            <button
              type="button"
              onClick={addEmptyItem}
              className="flex shrink-0 items-center gap-2 rounded-md border border-accent bg-background-300 px-4 py-2 body-sm-semibold text-accent shadow-sm hover:bg-accent/5"
            >
              <PlusIcon className="size-5" />
              Agregar Producto
            </button>
          )}
        </div>

        {banner && (
          <FeedbackBanner banner={banner} onClose={() => setBanner(null)} />
        )}

        <ProductDetailsTable
          items={pageItems}
          onUpdate={(barcode, updates) => updateItem(barcode, updates)}
          onDelete={handleDelete}
          onFilePicked={handleFilePicked}
          pageIndex={pageIndex}
          pageCount={pageCount}
          onPageChange={setPageIndex}
          totalCount={scannedItems.length}
          columnVisibility={columnVisibility}
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
