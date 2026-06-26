"use client";

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export type FeedbackBannerState = {
  type: "success" | "error";
  message: string;
} | null;

interface FeedbackBannerProps {
  banner: NonNullable<FeedbackBannerState>;
  onClose: () => void;
  className?: string;
}

export function FeedbackBanner({ banner, onClose, className }: FeedbackBannerProps) {
  const isSuccess = banner.type === "success";

  const color = isSuccess ? "#006922" : "#cd2b31";
  const bg = isSuccess ? "#f2f6f2" : "#faf2f2";

  return (
    <div
      role="alert"
      className={cn("fixed right-5 top-24 z-50 flex w-full max-w-[443px] items-center justify-between gap-4 rounded-lg px-3 py-4", className)}
      style={{ backgroundColor: bg, borderLeft: `5px solid ${color}` }}
    >
      <div className="flex items-center gap-2">
        {isSuccess ? (
          <CheckCircleIcon className="size-6 shrink-0" style={{ color }} />
        ) : (
          <ExclamationTriangleIcon className="size-6 shrink-0" style={{ color }} />
        )}
        <p className="body-lg-regular leading-snug" style={{ color }}>
          {banner.message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="shrink-0 transition-opacity hover:opacity-60"
        style={{ color }}
      >
        <XMarkIcon className="size-6" />
      </button>
    </div>
  );
}
