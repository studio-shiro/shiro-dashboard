"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownCircleIcon,
  DocumentPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { useProductWizardStore } from "@/store/productWizard";
import { WizardProgressBar } from "@/components/products/wizard/WizardProgressBar";
import { WizardBottomNav } from "@/components/products/wizard/WizardBottomNav";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import { downloadTemplate, parseExcelFile } from "@/lib/excel";
import { getProductColumnsAction } from "@/actions/product-columns";
import { useFeedbackBanner } from "@/hooks/use-feedback-banner";
import { cn } from "@/lib/utils";
import Button from "@/components/shared/Button";
import { Callout } from "@/components/shared/Callout";

const MAX_SIZE_MB = 5;

export default function ExcelUploadPage() {
  const router = useRouter();
  const { method, reset, setMethod, addItem } = useProductWizardStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const { banner, showBanner, closeBanner } = useFeedbackBanner();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (method !== "excel") router.replace("/products/new");
  }, [method, router]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      showBanner({
        type: "error",
        message: "Solo se aceptan archivos .xlsx (Excel).",
      });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showBanner({
        type: "error",
        message: `El archivo supera el límite de ${MAX_SIZE_MB}MB.`,
      });
      return;
    }
    setSelectedFile(file);
    closeBanner();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleDownloadTemplate() {
    try {
      const visibility = await getProductColumnsAction();
      downloadTemplate(visibility);
      showBanner(
        { type: "success", message: "Plantilla descargada correctamente." },
        3000,
      );
    } catch {
      showBanner({
        type: "error",
        message: "La plantilla no se pudo descargar.",
      });
    }
  }

  async function handleContinue() {
    if (!selectedFile || isParsing) return;
    setIsParsing(true);
    try {
      const products = await parseExcelFile(selectedFile);
      if (products.length === 0) {
        showBanner({
          type: "error",
          message: "El archivo no contiene productos.",
        });
        return;
      }
      reset();
      setMethod("excel");
      for (const p of products) addItem(p);
      router.push("/products/new/details");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "El archivo no se subió correctamente. Reintentalo más tarde.";
      showBanner({ type: "error", message: msg });
    } finally {
      setIsParsing(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-2.5">
      {banner && <FeedbackBanner banner={banner} onClose={closeBanner} />}

      {/* Content */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-[500px] flex-col gap-9">
          <div className="flex flex-col gap-4">
            {/* Heading */}
            <div className="flex flex-col gap-1">
              <h1 className="heading-xl text-text-500">Subí tu Excel</h1>
              <p className="body-md-regular text-text-400">
                Subí tu archivo excel para agregar productos nuevos a tu
                inventario.
              </p>
            </div>

            {/* Info banner */}
            <Callout>
              Recordá que los nombres de las columnas de tu archivo deben{" "}
              <strong className="font-semibold">coincidir exactamente</strong>{" "}
              con los nombres configurados en tu inventario.
            </Callout>

            {/* Download template */}
            <Button
              type="button"
              variant="tertiary"
              size="xs"
              className="w-full"
              onClick={() => {
                void handleDownloadTemplate();
              }}
            >
              <ArrowDownCircleIcon className="size-5 shrink-0" />
              Descargar plantilla
            </Button>
          </div>

          {/* Drop zone or selected file */}
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex h-[186px] w-full flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed bg-white shadow-lg transition-colors",
                isDragging ? "border-accent bg-accent/5" : "border-border-400",
              )}
            >
              <div className="flex flex-col items-center gap-2.5">
                <DocumentPlusIcon
                  className={cn(
                    "size-12",
                    isDragging ? "text-accent" : "text-text-300",
                  )}
                />
                <div className="flex flex-col gap-0.5">
                  <p className="body-md-regular text-text-500">
                    Arrastra tu archivo o subilo desde tu computadora.
                  </p>
                  <p className="body-xs-regular text-text-400">
                    Formatos permitidos: .xlsx (excel). Límite por archivo: 5MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="xs"
                onClick={() => fileInputRef.current?.click()}
              >
                Seleccionar Archivo
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="heading-sm text-text-500">Archivos Subidos</p>
              <div className="flex h-14 items-center gap-3 rounded-xl border border-[#ff9c7a] bg-[rgba(255,156,122,0.05)] p-4">
                <DocumentIcon className="size-[31px] shrink-0 text-accent" />
                <span className="flex-1 body-md-medium text-text-500 truncate">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="shrink-0 text-text-300 transition-colors hover:text-text-500"
                >
                  <XMarkIcon className="size-6" />
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Progress */}
      <WizardProgressBar steps={["complete", "complete", "current", "empty"]} />

      {/* Nav */}
      <WizardBottomNav
        onBack={() => router.push("/products/new/excel")}
        onNext={() => {
          void handleContinue();
        }}
        nextDisabled={!selectedFile || isParsing}
        nextLabel={isParsing ? "Procesando..." : "Continuar"}
      />
    </div>
  );
}
