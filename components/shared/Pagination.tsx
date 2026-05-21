"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface PaginationProps {
  pageIndex: number;
  pageCount: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGoTo: (page: number) => void;
}

function buildPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i);
  if (current <= 2) return [0, 1, 2, "...", total - 1];
  if (current >= total - 3) return [0, "...", total - 3, total - 2, total - 1];
  return [0, "...", current - 1, current, current + 1, "...", total - 1];
}

export function Pagination({
  pageIndex,
  pageCount,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  onGoTo,
}: PaginationProps) {
  const btnBase =
    "flex size-8 items-center justify-center rounded-md font-body text-sm transition-colors";
  const btnInactive = "text-text-400 hover:bg-background-300";
  const btnDisabled = "text-text-300 cursor-not-allowed opacity-40";

  const pages = buildPageRange(pageIndex, pageCount);

  return (
    <div className="flex items-center justify-center gap-1 py-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canPrevious}
        className={cn(btnBase, canPrevious ? btnInactive : btnDisabled)}
        aria-label="Página anterior"
      >
        <ChevronLeftIcon className="size-4" />
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex size-8 items-center justify-center font-body text-sm text-text-400"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onGoTo(page as number)}
            className={cn(
              btnBase,
              page === pageIndex
                ? "bg-accent font-semibold text-white"
                : btnInactive,
            )}
          >
            {(page as number) + 1}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className={cn(btnBase, canNext ? btnInactive : btnDisabled)}
        aria-label="Página siguiente"
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </div>
  );
}
