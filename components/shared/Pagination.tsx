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
  const pages = buildPageRange(pageIndex, pageCount);

  return (
    <div className="flex items-center justify-center gap-1 p-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canPrevious}
        className={cn(
          "flex size-[22px] shrink-0 items-center justify-center transition-colors",
          canPrevious
            ? "text-text-400 hover:text-text-500"
            : "cursor-not-allowed text-text-300 opacity-40",
        )}
        aria-label="Página anterior"
      >
        <ChevronLeftIcon className="size-[22px]" />
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex w-8 items-center justify-center rounded-[4px] py-[9px] body-md-medium text-text-400"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onGoTo(page as number)}
            className={cn(
              "flex items-center justify-center rounded-[4px] py-[9px] transition-colors",
              page === pageIndex
                ? "w-[38px] bg-accent/15 body-md-semibold text-accent"
                : "w-8 body-md-medium text-text-400 hover:bg-background-300",
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
        className={cn(
          "flex size-[22px] shrink-0 items-center justify-center transition-colors",
          canNext
            ? "text-text-400 hover:text-text-500"
            : "cursor-not-allowed text-text-300 opacity-40",
        )}
        aria-label="Página siguiente"
      >
        <ChevronRightIcon className="size-[22px]" />
      </button>
    </div>
  );
}
