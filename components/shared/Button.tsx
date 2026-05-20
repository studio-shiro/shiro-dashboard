import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type HeroIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: "xs" | "md" | "lg";
  icon?: HeroIcon;
}

const Button = ({
  children,
  icon: Icon,
  size = "md",
  className,
  ...props
}: Props) => {
  return (
    <button
      type={props.type || "button"}
      {...props}
      className={cn(
        "flex items-center justify-center bg-accent font-body font-medium text-white transition-colors hover:bg-accent-hover",
        size === "xs" && "gap-1.5 rounded-md px-3 py-1.5 text-xs",
        size === "md" && "gap-2 rounded-lg px-4 py-2 text-sm",
        size === "lg" && "gap-2.5 rounded-xl px-6 py-3 text-base",
        className,
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            size === "xs" && "h-4 w-4",
            size === "md" && "h-5 w-5",
            size === "lg" && "h-6 w-6",
          )}
        />
      )}

      {children}
    </button>
  );
};

export default Button;
