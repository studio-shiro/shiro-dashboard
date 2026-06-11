"use client";

import { useState, useRef, useCallback } from "react";
import type { FeedbackBannerState } from "@/components/shared/FeedbackBanner";

export function useFeedbackBanner() {
  const [banner, setBanner] = useState<FeedbackBannerState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeBanner = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setBanner(null);
  }, []);

  const showBanner = useCallback(
    (state: NonNullable<FeedbackBannerState>, duration?: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setBanner(state);
      if (duration && duration > 0) {
        timerRef.current = setTimeout(() => setBanner(null), duration);
      }
    },
    [],
  );

  return { banner, showBanner, closeBanner };
}
