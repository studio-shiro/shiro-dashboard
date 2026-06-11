"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProductWizardStore } from "@/store/productWizard";
import { createProductsBulkAction } from "@/actions/products";

const LOADING_MESSAGES = [
  "Subiendo tus productos...",
  "Validando la información ingresada...",
  "Actualizando tu inventario...",
  "Guardando los cambios...",
  "Finalizando la carga...",
  "¡Ya casi terminamos!",
];

const MESSAGE_INTERVAL = 2000;
const FADE_DURATION = 300;
// Even when the upload resolves fast, keep the screen long enough for the
// user to see the messages rotate (Figma annotation: rotating phrases).
const MIN_DISPLAY_MS = 4500;

export default function UploadingPage() {
  const router = useRouter();
  const { scannedItems, reset } = useProductWizardStore();
  const started = useRef(false);

  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Advance through loading messages with fade, stopping on the last one —
  // the list reads as a progression, so looping back would look broken.
  useEffect(() => {
    if (msgIndex >= LOADING_MESSAGES.length - 1) return;
    const id = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
        setVisible(true);
      }, FADE_DURATION);
    }, MESSAGE_INTERVAL);
    return () => clearTimeout(id);
  }, [msgIndex]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!scannedItems.length) {
      router.replace("/products/new");
      return;
    }

    const startedAt = Date.now();
    createProductsBulkAction(scannedItems).then((result) => {
      const remaining = Math.max(0, MIN_DISPLAY_MS - (Date.now() - startedAt));
      setTimeout(() => {
        reset();
        if (result.error || !result.created) {
          router.replace("/products?uploadError=true");
        } else {
          router.replace(`/products?created=${result.created}`);
        }
      }, remaining);
    });
  }, [scannedItems, reset, router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background-400">
      <div className="flex flex-col items-center gap-6">
        <div className="flex h-[93px] flex-col items-center justify-end">
          <Image
            src="/shiro-logo-dot.svg"
            alt=""
            width={24}
            height={24}
            priority
            className="animate-[shiro-dot-bounce_1s_ease-in-out_infinite]"
          />
          <Image
            src="/shiro-logo-only-i.svg"
            alt="Shiro"
            width={28}
            height={66}
            priority
          />
        </div>
        <p
          className="heading-md text-text-500 transition-opacity"
          style={{
            opacity: visible ? 1 : 0,
            transitionDuration: `${FADE_DURATION}ms`,
          }}
        >
          {LOADING_MESSAGES[msgIndex]}
        </p>
      </div>
    </div>
  );
}
