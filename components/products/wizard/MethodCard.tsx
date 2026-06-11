import { cn } from "@/lib/utils";

interface MethodCardProps {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function MethodCard({
  label,
  icon: Icon,
  selected,
  disabled = false,
  onClick,
}: MethodCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-[181px] w-[162px] flex-col items-center justify-center rounded-md transition-colors",
        selected
          ? "border-2 border-accent bg-accent/10"
          : "border border-border-400 bg-white hover:border-text-400",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div className="flex w-[123px] flex-col items-center gap-10">
        <div
          className={cn(
            "flex h-[70px] w-full items-center justify-center",
            selected ? "text-text-500" : "text-text-400",
          )}
        >
          <Icon className="h-full w-auto" />
        </div>
        <span className="body-sm-semibold text-center text-text-500">
          {label}
        </span>
      </div>
    </button>
  );
}
