"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useProductWizardStore } from "@/store/productWizard";
import { WizardProgressBar } from "@/components/products/wizard/WizardProgressBar";
import Button from "@/components/shared/Button";
import { cn } from "@/lib/utils";

export default function ExcelDisclaimerPage() {
  const router = useRouter();
  const { method } = useProductWizardStore();
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (method !== "excel") router.replace("/products/new");
  }, [method, router]);

  return (
    <div className="flex flex-1 flex-col gap-2.5">
      {/* Content */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[600px] rounded-2xl bg-info-200 px-9 py-12 shadow-lg">
          <div className="flex flex-col items-center gap-8 text-center">
            <p className="font-body text-xl font-bold uppercase tracking-wide text-text-500">
              Importante
            </p>
            <div className="flex flex-col gap-5 body-lg-regular text-base leading-snug text-text-500">
              <p>
                Antes de importar tu archivo, verificá que los nombres de las
                columnas de tu planilla{" "}
                <strong className="font-semibold">coincidan exactamente</strong>{" "}
                con los nombres de las columnas configuradas en tu inventario.
              </p>
              <p>
                <strong className="font-semibold">
                  Si los nombres no coinciden
                </strong>
                , no podremos identificar correctamente la información y algunos
                datos podrían no importarse.
              </p>
              <p className="font-semibold">
                Te recomendamos revisar tu archivo antes de continuar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <WizardProgressBar steps={["complete", "current", "empty", "empty"]} />

      {/* Bottom nav with acknowledge checkbox */}
      <div className="flex items-center justify-between rounded-lg border-t border-border-200 bg-white px-5 py-3 shadow-sm">
        <Button
          variant="tertiary"
          size="xs"
          onClick={() => router.push("/products/new")}
          icon={ArrowLeftIcon}
          className="min-w-[108px]"
        >
          Volver
        </Button>

        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2.5 select-none">
            <button
              type="button"
              role="checkbox"
              aria-checked={acknowledged}
              onClick={() => setAcknowledged((v) => !v)}
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                acknowledged
                  ? "border-accent bg-accent"
                  : "border-border-300 bg-background-500",
              )}
            >
              {acknowledged && <CheckIcon className="size-3 text-white" />}
            </button>
            <span className="body-lg-regular text-text-500">
              Entiendo, continuar
            </span>
          </label>

          <Button
            variant="primary"
            size="xs"
            disabled={!acknowledged}
            onClick={() => router.push("/products/new/excel/upload")}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
