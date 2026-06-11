"use client";
import { useState, useEffect, useRef } from "react";
import { XMarkIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface LogoUploadModalProps {
  file: File;
  uploading: boolean;
  onConfirm: () => void;
  onClose: () => void;
  onNewFile: (file: File) => void;
}

export function LogoUploadModal({
  file,
  uploading,
  onConfirm,
  onClose,
  onNewFile,
}: LogoUploadModalProps) {
  const [zoom, setZoom] = useState(1);
  const [objectUrl, setObjectUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setZoom(1);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleInternalFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;
    if (!selected.type.startsWith("image/")) return;
    if (selected.size > 3 * 1024 * 1024) return;
    onNewFile(selected);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(56,58,61,0.4)]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex w-[500px] flex-col gap-4 rounded-[12px] bg-white p-9 shadow-sm">
        {/* Header */}
        <h2 className="text-2xl font-bold leading-none text-text-500">
          Subí tu Logo
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex size-6 items-center justify-center text-text-400 hover:text-text-500 transition-colors"
        >
          <XMarkIcon className="size-6" />
        </button>

        {/* Body */}
        <div className="flex flex-col items-center gap-5 w-full">
          {/* Circular preview */}
          <div className="size-[180px] shrink-0 overflow-hidden rounded-full border-[4.5px] border-border-400 bg-background-300">
            {objectUrl && (
              <img
                src={objectUrl}
                alt="Preview del logo"
                className="size-full object-contain"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center",
                }}
                draggable={false}
              />
            )}
          </div>

          {/* Zoom slider */}
          <div className="flex w-full items-center gap-4">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
              className="flex shrink-0 items-center justify-center text-text-400 hover:text-text-500 transition-colors"
              aria-label="Reducir zoom"
            >
              <MinusIcon className="size-5" />
            </button>
            <input
              type="range"
              min={1}
              max={2}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-[2px] flex-1 cursor-pointer appearance-none rounded-full bg-text-500 accent-text-500"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
              className="flex shrink-0 items-center justify-center text-text-400 hover:text-text-500 transition-colors"
              aria-label="Aumentar zoom"
            >
              <PlusIcon className="size-5" />
            </button>
          </div>

          {/* Re-select file */}
          <div className="flex w-full flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInternalFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-full items-center justify-center rounded-[6px] border border-accent bg-background-300 px-4 text-sm font-semibold text-accent shadow-sm transition-opacity hover:opacity-80"
            >
              Seleccionar Foto
            </button>
            <p className="body-sm-regular text-text-500">
              Formatos Aceptados: JPG, PNG, SVG y WEBP. Peso Máximo: 3MB.
            </p>
          </div>
        </div>

        {/* Confirm */}
        <button
          type="button"
          onClick={onConfirm}
          disabled={uploading}
          className={cn(
            "flex h-10 w-full items-center justify-center rounded-[6px] bg-accent px-4 text-sm font-semibold text-text-100 shadow-sm transition-opacity",
            uploading ? "cursor-not-allowed opacity-60" : "hover:opacity-90",
          )}
        >
          {uploading ? "Subiendo…" : "Subir"}
        </button>
      </div>
    </div>
  );
}
