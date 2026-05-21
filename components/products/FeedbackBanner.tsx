"use client";

import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import type { FeedbackBannerState } from "./ProductsView";

interface FeedbackBannerProps {
  banner: NonNullable<FeedbackBannerState>;
  onClose: () => void;
}

export function FeedbackBanner({ banner, onClose }: FeedbackBannerProps) {
  const isSuccess = banner.type === "success";

  return (
    <div
      role="alert"
      className={cn(
        "fixed right-6 top-4 z-50 flex w-full max-w-[360px] items-start gap-3 rounded-lg border px-4 py-3 shadow-[0px_4px_8px_-2px_rgba(112,113,116,0.1),0px_2px_4px_-2px_rgba(112,113,116,0.06)]",
        isSuccess
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800",
      )}
    >
      {isSuccess ? (
        <CheckCircleIcon className="mt-px size-4 shrink-0 text-green-500" />
      ) : (
        <ExclamationTriangleIcon className="mt-px size-4 shrink-0 text-red-500" />
      )}

      <p className="flex-1 body-md-regular leading-snug">{banner.message}</p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className={cn(
          "mt-px shrink-0 transition-opacity hover:opacity-60",
          isSuccess ? "text-green-600" : "text-red-600",
        )}
      >
        <XMarkIcon className="size-4" />
      </button>
    </div>
  );
}
