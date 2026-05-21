import {
  ArrowUpIcon,
  ArrowDownIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  label: string;
  value: string;
  unit?: string;
  /** Small top-right indicator: percentage + arrow + ? */
  trend?: number;
  trendLabel?: string;
  /** Colors the main value text and adds a direction arrow beside it */
  valueTrend?: "positive" | "negative";
  className?: string;
}

export function InsightCard({
  label,
  value,
  unit,
  trend,
  trendLabel,
  valueTrend,
  className,
}: InsightCardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;
  const showTrend = trend !== undefined;

  return (
    <div
      className={cn(
        "flex h-[100px] min-w-[180px] flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-border-200 bg-background-400 px-4 py-3.5 shadow-[0px_4px_8px_-2px_rgba(112,113,116,0.08),0px_2px_4px_-2px_rgba(112,113,116,0.06)]",
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate body-md-semibold text-text-400">
          {label}
        </span>

        {showTrend ? (
          <div className="flex shrink-0 items-center gap-0.5">
            <span
              className={cn(
                "body-sm-medium",
                isPositiveTrend ? "text-success-300" : "text-danger-300",
              )}
            >
              {isPositiveTrend ? "+" : ""}
              {trendLabel ?? `${trend}%`}
            </span>
            {isPositiveTrend ? (
              <ArrowUpIcon className="size-3.5 text-success-300" />
            ) : (
              <ArrowDownIcon className="size-3.5 text-danger-300" />
            )}
            <QuestionMarkCircleIcon className="size-3.5 text-text-300" />
          </div>
        ) : valueTrend !== undefined ? (
          <QuestionMarkCircleIcon className="size-3.5 shrink-0 text-text-300" />
        ) : null}
      </div>

      {/* Value row */}
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "font-body text-[28px] font-bold leading-none tracking-tight",
              valueTrend === "positive"
                ? "text-success-300"
                : valueTrend === "negative"
                  ? "text-danger-300"
                  : "text-text-500",
            )}
          >
            {value}
          </span>
          {valueTrend === "positive" && (
            <ArrowUpIcon className="mb-0.5 size-5 text-success-300" />
          )}
          {valueTrend === "negative" && (
            <ArrowDownIcon className="mb-0.5 size-5 text-danger-300" />
          )}
        </div>
        {unit && (
          <span className="pb-0.5 font-body text-[10px] leading-3 text-text-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
