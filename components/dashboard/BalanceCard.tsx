import {
  ArrowUpIcon,
  ArrowDownIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col gap-0.5">
        <h2 className="font-body text-2xl font-bold leading-none text-text-500">
          {title}
        </h2>
        <div className="flex flex-col">
          {subtitle && (
            <p className="body-md-regular text-text-400">{subtitle}</p>
          )}
          {lastUpdated && (
            <p className="font-body text-[10px] leading-3 text-text-400">
              {lastUpdated}
            </p>
          )}
        </div>
      </div>

      <div className="flex h-[100px] w-full items-center justify-between overflow-hidden rounded-2xl border border-border-100 bg-background-400 py-4 pl-5 pr-6 shadow-md">
        <span className="font-body text-[40px] font-bold leading-none tracking-tight text-text-500">
          {value}
        </span>
        {showTrend && (
          <div className="flex items-center gap-1 pb-1">
            <div
              className={cn(
                "flex size-[22px] items-center justify-center rounded-full",
                isPositive ? "bg-success-100" : "bg-danger-100",
              )}
            >
              {isPositive ? (
                <ArrowUpIcon className="size-3 text-success-300" />
              ) : (
                <ArrowDownIcon className="size-3 text-danger-300" />
              )}
            </div>
            <span
              className={cn(
                "body-md-medium",
                isPositive ? "text-success-300" : "text-danger-300",
              )}
            >
              {isPositive ? "+" : ""}
              {trendLabel ?? `${trend}%`}
            </span>
            <QuestionMarkCircleIcon className="size-4 text-text-300" />
          </div>
        )}
      </div>
    </div>
  );
}
