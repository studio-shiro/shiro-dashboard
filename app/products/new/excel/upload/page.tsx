"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownCircleIcon,
  DocumentPlusIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { useProductWizardStore } from "@/store/productWizard";
import { WizardProgressBar } from "@/components/products/wizard/WizardProgressBar";
import { WizardBottomNav } from "@/components/products/wizard/WizardBottomNav";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import type { FeedbackBannerState } from "@/components/shared/FeedbackBanner";
import { downloadTemplate, parseExcelFile } from "@/lib/excel";
import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 5;

export default function ExcelUploadPage() {
  const router = useRouter();
  const { method, reset, setMethod, addItem } = useProductWizardStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [banner, setBanner] = useState<FeedbackBannerState>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (method !== "excel") router.replace("/products/new");
  }, [method, router]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setBanner({ type: "error", message: "Solo se aceptan archivos .xlsx (Excel)." });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setBanner({ type: "error", message: `El archivo supera el límite de ${MAX_SIZE_MB}MB.` });
      return;
    }
    setSelectedFile(file);
    setBanner(null);
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

  function handleDownloadTemplate() {
    try {
      downloadTemplate();
      setBanner({ type: "success", message: "Plantilla descargada correctamente." });
    } catch {
      setBanner({ type: "error", message: "La plantilla no se pudo descargar." });
    }
  }

  async function handleContinue() {
    if (!selectedFile || isParsing) return;
    setIsParsing(true);
    try {
      const products = await parseExcelFile(selectedFile);
      if (products.length === 0) {
        setBanner({ type: "error", message: "El archivo no contiene productos." });
        return;
      }
      reset();
      setMethod("excel");
      for (const p of products) addItem(p);
      router.push("/products/new/details");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "El archivo no se subió correctamente. Reintentalo más tarde.";
      setBanner({ type: "error", message: msg });
    } finally {
      setIsParsing(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-2.5">
      {banner && <FeedbackBanner banner={banner} onClose={() => setBanner(null)} />}

      {/* Content */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-[500px] flex-col gap-4">
          {/* Heading */}
          <div className="flex flex-col gap-1">
            <h1 className="heading-xl text-text-500">Subí tu Excel</h1>
            <p className="body-md-regular text-text-400">
              Subí tu archivo excel para agregar productos nuevos a tu inventario.
            </p>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-2 rounded-lg border-l-4 border-[#3446a5] bg-[#f3f4fd] px-3 py-4">
            <InformationCircleIcon className="mt-px size-6 shrink-0 text-[#3446a5]" />
            <p className="body-lg-regular text-[#3446a5]">
              Recordá que los nombres de las columnas de tu archivo deben{" "}
              <strong className="font-semibold">coincidir exactamente</strong>{" "}
              con los nombres configurados en tu inventario.
            </p>
          </div>

          {/* Download template */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border-400 bg-white px-4 shadow-sm transition-colors hover:bg-background-300 body-sm-semibold text-text-500"
          >
            <ArrowDownCircleIcon className="size-5 shrink-0" />
            Descargar plantilla
          </button>

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
                  className={cn("size-12", isDragging ? "text-accent" : "text-text-300")}
                />
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <p className="body-md-regular text-text-500">
                    Arrastra tu archivo o subilo desde tu computadora.
                  </p>
                  <p className="body-xs-regular text-text-400">
                    Formatos permitidos: .xlsx (excel). Límite por archivo: 5MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-6 items-center gap-1.5 rounded px-2.5 bg-accent body-sm-semibold text-white shadow-sm hover:bg-accent-hover transition-colors"
              >
                Seleccionar Archivo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="body-md-semibold text-text-500">Archivos Subidos</p>
              <div className="flex items-center gap-3 rounded-lg border border-border-300 bg-white px-3 py-2.5 shadow-sm">
                <DocumentIcon className="size-6 shrink-0 text-accent" />
                <span className="flex-1 body-md-regular text-text-500 truncate">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="shrink-0 text-text-300 transition-colors hover:text-text-500"
                >
                  <XMarkIcon className="size-5" />
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
        onNext={() => { void handleContinue(); }}
        nextDisabled={!selectedFile || isParsing}
        nextLabel={isParsing ? "Procesando..." : "Continuar"}
      />
    </div>
  );
}
