"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProductWizardStore } from "@/store/productWizard";
import type { WizardProduct } from "@/store/productWizard";
import { lookupBarcodeAction } from "@/actions/barcode";
import type { BarcodeResult } from "@/types/barcode";
import {
  BarcodeInput,
  type BarcodeInputHandle,
} from "@/components/products/wizard/BarcodeInput";
import { ScannedProductList } from "@/components/products/wizard/ScannedProductList";
import { ScanErrorModal } from "@/components/products/wizard/ScanErrorModal";
import { WizardProgressBar } from "@/components/products/wizard/WizardProgressBar";
import { WizardBottomNav } from "@/components/products/wizard/WizardBottomNav";

function buildWizardProduct(data: BarcodeResult): WizardProduct {
  return {
    barcode: data.barcode,
    source: data.source,
    name: data.name ?? "",
    reference: "",
    image_url: data.image_url ?? null,
    brand_id: null,
    brand_name: data.brand ?? null,
    category_id: null,
    category_name: data.category ?? null,
    description: data.description ?? null,
    price: null,
    cost_price: null,
    stock_quantity: 0,
    tracks_batches: false,
    lot_number: null,
    batch_barcode: data.barcode,
    manufacture_date: null,
    expiration_date: null,
  };
}

export default function ScanPage() {
  const router = useRouter();
  const { method, scannedItems, addItem, removeItem } = useProductWizardStore();
  const [scanError, setScanError] = useState(false);
  const [externalTooltip, setExternalTooltip] = useState<
    "danger" | "warning" | "duplicate" | null
  >(null);
  const [hasPendingDigits, setHasPendingDigits] = useState(false);
  const continueWarnedRef = useRef(false);
  const barcodeInputRef = useRef<BarcodeInputHandle>(null);
  const [isPending, startTransition] = useTransition();

  // Guard: redirect if not coming from scan method
  useEffect(() => {
    if (method !== "scan") {
      router.replace("/products/new");
    }
  }, [method, router]);

  function handleBarcode(barcode: string) {
    setScanError(false);
    setExternalTooltip(null);

    if (scannedItems.some((item) => item.barcode === barcode)) {
      setExternalTooltip("duplicate");
      return;
    }

    startTransition(async () => {
      const result = await lookupBarcodeAction(barcode);
      if (result.error) {
        setScanError(true);
        return;
      }
      if (!result.data) return;

      // Not found in any lookup step (local → catalog → external API):
      // invalid-code tooltip; digits stay on screen for review.
      if (result.data.source === "unknown") {
        setExternalTooltip("danger");
        return;
      }

      addItem(buildWizardProduct(result.data));
      barcodeInputRef.current?.clear();
    });
  }

  function handleDigitsChange(hasDigits: boolean) {
    setHasPendingDigits(hasDigits);
    continueWarnedRef.current = false;
    setExternalTooltip(null);
  }

  function handleNext() {
    // Unsubmitted code: first click warns, second click ignores it.
    if (hasPendingDigits && !continueWarnedRef.current) {
      continueWarnedRef.current = true;
      setExternalTooltip("warning");
      return;
    }
    router.push("/products/new/details");
  }

  return (
    <div className="flex flex-1 flex-col gap-2.5">
      {/* Content */}
      <div className="flex flex-1 items-center justify-center">
        <div
          className={
            scannedItems.length > 0
              ? "flex items-center justify-center gap-16"
              : "flex flex-col items-center gap-8"
          }
        >
          {/* Scanner + input */}
          <div className="flex w-[460px] shrink-0 flex-col items-center gap-12">
            <div className="flex flex-col gap-1">
              <h1 className="heading-xl text-text-500">
                Escanea tu Producto Nuevo
              </h1>
              <p className="body-md-regular text-text-400">
                Escanea tu producto con tu lector de códigos de barra o
                ingresalo manualmente. Podés agregar más de uno.
              </p>
            </div>

            {/* Barcode scanner graphic */}
            <Image
              src="/barcode.svg"
              alt="Escáner de código de barras"
              width={390}
              height={141}
              priority
            />

            <div className="flex w-full flex-col gap-1">
              <BarcodeInput
                ref={barcodeInputRef}
                onSubmit={handleBarcode}
                disabled={isPending}
                tooltip={externalTooltip}
                onDigitsChange={handleDigitsChange}
              />
              {isPending && (
                <p className="body-sm-regular text-text-400">
                  Buscando producto…
                </p>
              )}
            </div>
          </div>

          {/* Scanned list */}
          {scannedItems.length > 0 && (
            <div className="w-[760px] shrink-0">
              <ScannedProductList items={scannedItems} onRemove={removeItem} />
            </div>
          )}
        </div>
      </div>

      {/* Progress + nav */}
      <WizardProgressBar steps={["complete", "current", "empty"]} />
      <WizardBottomNav
        onBack={() => router.push("/products/new")}
        onNext={handleNext}
        nextDisabled={scannedItems.length === 0 || isPending}
      />

      {scanError && <ScanErrorModal onRetry={() => setScanError(false)} />}
    </div>
  );
}
