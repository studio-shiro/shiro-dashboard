import { ArrowUp, ArrowDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  label: string;
  value: string;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export function InsightCard({
  label,
  value,
  unit,
  trend,
  trendLabel,
  className,
}: InsightCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  const showTrend = trend !== undefined;

  return (
    <div
      className={cn(
        "flex h-25 min-w-50 flex-1 flex-col gap-2 overflow-hidden rounded-2xl border border-border-100 bg-background-400 px-3 py-4 shadow-[0px_4px_8px_-2px_rgba(112,113,116,0.1),0px_2px_4px_-2px_rgba(112,113,116,0.06)]",
        className,
      )}
    >
      {/* Header row: label + trend badge */}
      <div className="flex h-5 items-center gap-2">
        <span className="flex-1 truncate font-body text-sm font-bold leading-normal text-text-400">
          {label}
        </span>
        {showTrend && (
          <div className="flex shrink-0 items-center gap-0.5">
            <span
              className={cn(
                "font-body text-xs leading-4",
                isPositive ? "text-success-300" : "text-danger-300",
              )}
            >
              {isPositive ? "+" : ""}
              {trendLabel ?? `${trend}%`}
            </span>
            {isPositive ? (
              <ArrowUp className="size-4 text-success-300" />
            ) : (
              <ArrowDown className="size-4 text-danger-300" />
            )}
            <HelpCircle className="size-4 text-text-300" />
          </div>
        )}
      </div>

      {/* Value row */}
      <div className="flex items-end justify-between">
        <span className="font-body text-[30px] font-bold leading-none text-text-500">
          {value}
        </span>
        {unit && (
          <span className="font-body text-[10px] leading-3 text-text-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

interface BalanceCardProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  value: string;
  trend?: number;
  trendLabel?: string;
}

export function BalanceCard({
  title,
  subtitle,
  lastUpdated,
  value,
  trend,
  trendLabel,
}: BalanceCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  const showTrend = trend !== undefined;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Section header */}
      <div className="flex flex-col gap-1">
        <h2 className="font-body text-2xl font-bold leading-none text-text-500">
          {title}
        </h2>
        {subtitle && (
          <div className="flex flex-col">
            <p className="font-body text-sm leading-5 text-text-400">
              {subtitle}
            </p>
            {lastUpdated && (
              <p className="font-body text-[10px] leading-3 text-text-400">
                {lastUpdated}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card */}
      <div className="flex h-25 w-full items-center justify-between overflow-hidden rounded-2xl border border-border-100 bg-background-400 py-4 pl-4 pr-6 shadow-[0px_4px_8px_-2px_rgba(112,113,116,0.1),0px_2px_4px_-2px_rgba(112,113,116,0.06)]">
        <span className="font-body text-[36px] font-bold leading-none text-text-500">
          {value}
        </span>
        {showTrend && (
          <div className="flex items-end gap-0.5 self-end pb-2">
            <span
              className={cn(
                "font-body text-sm leading-5",
                isPositive ? "text-success-300" : "text-danger-300",
              )}
            >
              {isPositive ? "+" : ""}
              {trendLabel ?? `${trend}%`}
            </span>
            {isPositive ? (
              <ArrowUp className="size-4 text-success-300" />
            ) : (
              <ArrowDown className="size-4 text-danger-300" />
            )}
            <HelpCircle className="size-4 text-text-300" />
          </div>
        )}
      </div>
    </div>
  );
}
