"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProductWizardStore } from "@/store/productWizard";
import { CancelWizardModal } from "./CancelWizardModal";
import Button from "@/components/shared/Button";

export function WizardTopBar() {
  const router = useRouter();
  const { scannedItems, reset } = useProductWizardStore();
  const [showCancel, setShowCancel] = useState(false);

  function handleCancelClick() {
    if (scannedItems.length > 0) {
      setShowCancel(true);
    } else {
      reset();
      router.push("/products");
    }
  }

  function handleConfirmCancel() {
    reset();
    router.push("/products");
  }

  return (
    <>
      <header className="flex h-[84px] items-center justify-between rounded-lg bg-white px-7 py-3 shadow-md">
        <div className="relative h-8 w-20">
          <Image
            src="/shiro-logo-nav.svg"
            alt="Shiro Studio"
            fill
            className="object-contain object-left"
            priority
          />
        </div>

        <Button
          variant="link"
          size="xs"
          type="button"
          onClick={handleCancelClick}
          className="text-accent transition-colors hover:text-accent-hover"
        >
          Cancelar
        </Button>
      </header>

      {showCancel && (
        <CancelWizardModal
          onConfirm={handleConfirmCancel}
          onClose={() => setShowCancel(false)}
        />
      )}
    </>
  );
}
