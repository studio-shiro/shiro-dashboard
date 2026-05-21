import { cn } from "@/lib/utils";

type TagVariant = "neutral" | "success" | "warning" | "danger" | "info";

interface TagProps {
  variant?: TagVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<TagVariant, string> = {
  neutral: "bg-background-200 text-text-400",
  success: "bg-success-100 text-success-400",
  warning: "bg-warning-100 text-warning-400",
  danger: "bg-danger-100 text-danger-300",
  info: "bg-info-100 text-info-400",
};

export function Tag({ variant = "neutral", children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 py-0.5 body-sm-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
