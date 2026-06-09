"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import { BarcodeIcon } from "@/components/icons/BarcodeIcon";
import { useProductWizardStore } from "@/store/productWizard";
import { MethodCard } from "@/components/products/wizard/MethodCard";
import { WizardProgressBar } from "@/components/products/wizard/WizardProgressBar";
import { WizardBottomNav } from "@/components/products/wizard/WizardBottomNav";

export default function ProductMethodPage() {
  const router = useRouter();
  const { setMethod, reset } = useProductWizardStore();
  const [selected, setSelected] = useState<"scan" | "manual" | "excel" | null>(
    null,
  );

  function handleContinue() {
    if (!selected) return;
    reset();
    setMethod(selected);
    if (selected === "scan") {
      router.push("/products/new/scan");
    } else if (selected === "manual") {
      router.push("/products/new/details");
    } else if (selected === "excel") {
      router.push("/products/new/excel");
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-2.5">
      {/* Content */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="heading-xl text-text-500">
              Agrega un Producto Nuevo
            </h1>
            <p className="body-md-regular max-w-sm text-text-400">
              Elegí cómo querés agregar tus productos: escaneando el código de
              barras, ingresando los datos manualmente o importando una planilla
              de Excel.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <MethodCard
              label="Escanear Código"
              icon={BarcodeIcon}
              selected={selected === "scan"}
              onClick={() => setSelected("scan")}
            />
            <MethodCard
              label="Ingreso Manual"
              icon={PencilIcon}
              selected={selected === "manual"}
              onClick={() => setSelected("manual")}
            />
            <MethodCard
              label="Importar de Excel"
              icon={PaperClipIcon}
              selected={selected === "excel"}
              onClick={() => setSelected("excel")}
            />
          </div>
        </div>
      </div>

      {/* Progress + nav */}
      <WizardProgressBar
        steps={
          selected === "excel"
            ? ["current", "empty", "empty", "empty"]
            : selected === "manual"
              ? ["current", "empty"]
              : ["current", "empty", "empty"]
        }
      />
      <WizardBottomNav
        onBack={() => router.push("/products")}
        onNext={handleContinue}
        nextDisabled={!selected}
      />
    </div>
  );
}
