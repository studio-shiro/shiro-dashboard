import { cn } from "@/lib/utils";

type IconProp =
  | React.ComponentType<React.SVGProps<SVGSVGElement>>
  | string;

interface MethodCardProps {
  label: string;
  icon: IconProp;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function MethodCard({
  label,
  icon,
  selected,
  disabled = false,
  onClick,
}: MethodCardProps) {
  const renderIcon = () => {
    if (typeof icon === "string") {
      return <img src={icon} alt="" className="size-full" />;
    }
    const Icon = icon;
    return <Icon className="size-full" />;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border p-8 transition-colors",
        selected
          ? "border-accent bg-accent/10"
          : "border-border-200 bg-white hover:border-border-400",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div className={cn("size-12 text-text-400", selected && "text-accent")}>
        {renderIcon()}
      </div>
      <span
        className={cn(
          "body-md-semibold",
          selected ? "text-accent" : "text-text-500",
        )}
      >
        {label}
      </span>
    </button>
  );
}
