"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProductWizardStore } from "@/store/productWizard";
import { createProductsBulkAction } from "@/actions/products";

export default function UploadingPage() {
  const router = useRouter();
  const { scannedItems, reset } = useProductWizardStore();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!scannedItems.length) {
      router.replace("/products/new");
      return;
    }

    createProductsBulkAction(scannedItems).then((result) => {
      reset();
      if (result.error || !result.created) {
        router.replace("/products?uploadError=true");
      } else {
        router.replace(`/products?created=${result.created}`);
      }
    });
  }, [scannedItems, reset, router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center">
          <Image
            src="/shiro-logo-dot.svg"
            alt=""
            width={22}
            height={22}
            priority
          />
          <Image
            src="/shiro-logo-only-i.svg"
            alt="Shiro"
            width={27}
            height={64}
            priority
          />
        </div>
        <p className="body-lg-regular text-text-400">Subiendo tus productos...</p>
      </div>
    </div>
  );
}
