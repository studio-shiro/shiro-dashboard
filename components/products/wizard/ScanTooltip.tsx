import { cn } from "@/lib/utils";

export type ScanTooltipVariant = "info" | "danger" | "warning" | "duplicate";

const VARIANT_BG: Record<ScanTooltipVariant, string> = {
  info: "bg-info-200",
  danger: "bg-danger-200",
  warning: "bg-warning-200",
  duplicate: "bg-accent-disabled",
};

interface ScanTooltipProps {
  variant: ScanTooltipVariant;
  children: React.ReactNode;
}

/** Floating info bubble with a left-pointing arrow, anchored next to the barcode digit cells */
export function ScanTooltip({ variant, children }: ScanTooltipProps) {
  return (
    <div
      className={cn(
        "relative w-[226px] rounded-lg py-2 pl-3 pr-2.5 drop-shadow-md",
        VARIANT_BG[variant],
      )}
    >
      <span
        className={cn(
          "absolute -left-1 top-3 size-2.5 rotate-45",
          VARIANT_BG[variant],
        )}
      />
      <p className="body-sm-regular text-text-500">{children}</p>
    </div>
  );
}
