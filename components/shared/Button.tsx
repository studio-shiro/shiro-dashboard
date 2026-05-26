import Link from "next/link";
import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type HeroIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type SharedProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "link";
  size?: "xs" | "md" | "lg";
  icon?: HeroIcon;
  className?: string;
};

type AsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedProps> & {
    href?: never;
    ref?: React.Ref<HTMLButtonElement>;
  };

type AsLink = SharedProps & {
  href: string;
  target?: string;
  rel?: string;
};

export type ButtonProps = AsButton | AsLink;

const variantStyles: Record<NonNullable<SharedProps["variant"]>, string> = {
  primary:
    "bg-accent text-text-100 shadow-sm " +
    "hover:bg-accent-hover " +
    "active:bg-accent-selected " +
    "disabled:bg-accent-disabled disabled:text-text-200 disabled:shadow-none",

  secondary:
    "bg-background-300 text-accent border border-accent shadow-sm " +
    "hover:bg-[#ffd3c3] hover:text-accent-hover hover:border-accent-hover " +
    "active:bg-[rgba(255,112,62,0.56)] active:text-accent-selected active:border-accent-selected " +
    "disabled:bg-[#ffede7] disabled:text-accent-disabled disabled:border-accent-disabled",

  tertiary:
    "bg-white text-text-500 border border-border-400 shadow-sm " +
    "hover:bg-background-300 " +
    "active:bg-background-200 " +
    "disabled:text-accent-disabled",

  link:
    "bg-transparent text-text-500 " +
    "hover:text-accent-hover " +
    "active:text-accent-selected " +
    "disabled:text-accent-disabled",
};

// xs = Figma SM (36px / 12px), md = Figma MD (40px / 14px), lg = Figma LG (48px / 16px)
const sizeStyles: Record<NonNullable<SharedProps["size"]>, string> = {
  xs: "gap-2 rounded-md px-4 py-2.5 body-sm-semibold",
  md: "gap-2 rounded-md px-[18px] py-2.5 body-md-semibold",
  lg: "gap-2 rounded-md px-5 py-3 body-lg-semibold",
};

export default function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", icon: Icon, className } =
    props;

  const classes = cn(
    "inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if ("href" in props && props.href !== undefined) {
    const { href, target, rel } = props as AsLink;
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {Icon && <Icon className="size-5 shrink-0" />}
        {children}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    icon: _i,
    className: _c,
    children: _ch,
    ref,
    ...buttonRest
  } = props as AsButton;
  return (
    <button
      ref={ref}
      type={buttonRest.type ?? "button"}
      {...buttonRest}
      className={classes}
    >
      {Icon && <Icon className="size-5 shrink-0" />}
      {children}
    </button>
  );
}
