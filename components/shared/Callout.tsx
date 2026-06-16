import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import React from "react";

type CalloutVariant = "info";

type CalloutProps = {
  variant?: CalloutVariant;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<
  CalloutVariant,
  {
    container: string;
    icon: string;
    text: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }
> = {
  info: {
    container: "border-info-400 bg-info-100",
    icon: "text-info-400",
    text: "text-info-400",
    Icon: InformationCircleIcon,
  },
};

export function Callout({ variant = "info", children, className }: CalloutProps) {
  const { Icon, container, icon, text } = variantStyles[variant];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border-l-4 px-3 py-4",
        container,
        className,
      )}
    >
      <Icon className={cn("size-6 shrink-0", icon)} />
      <p className={cn("body-lg-regular", text)}>{children}</p>
    </div>
  );
}
