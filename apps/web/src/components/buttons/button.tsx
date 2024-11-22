import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentPropsWithRef, forwardRef } from "react";
import { IconType } from "react-icons";
import { FaArrowsRotate } from "react-icons/fa6";

export type ButtonVariant =
  | "primary"
  | "outline"
  | "confirmed"
  | "secondary"
  | "detail"
  | "accent"
  | "primary-outline";

export type ButtonSize = "sm" | "base" | "md" | "lg";

export type ButtonProps = {
  isLoading?: boolean;
  isDarkBg?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IconType;
  rightIcon?: IconType;
  classNames?: {
    leftIcon?: string;
    rightIcon?: string;
  };
  block?: boolean;
  href?: string;
} & ComponentPropsWithRef<"button">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      disabled: buttonDisabled,
      isLoading,
      variant = "primary",
      size = "base",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      classNames,
      block,
      href,
      ...rest
    }: ButtonProps,
    ref,
  ) {
    const disabled = isLoading || buttonDisabled;

    const style = cn(
      "inline-flex items-center rounded-[5px] font-medium text-center",
      "focus-visible:ring focus:outline-none focus-visible:ring-primary",
      "shadow-sm",
      "transition-colors duration-75",
      "disabled:shadow-inner",
      block && "w-full justify-center",
      // Size
      size === "base" && "px-3 py-3.5 text-sm md:text-base",
      size === "sm" && "px-1 py-1 text-xs md:text-sm",
      size === "md" && "h-9 px-4 text-sm py-1.5",
      size === "lg" && "h-12 px-6 text-base",
      // Variants
      variant === "primary" && [
        "font-roboto-mono",
        "bg-primary text-[#070707]",
        "hover:bg-primary-hover",
        "active:bg-primary-active",
        "disabled:bg-primary-disabled disabled:opacity-30",
      ],
      variant === "secondary" && [
        "bg-secondary text-white",
        "hover:bg-secondary-hover",
        "active:bg-secondary-active",
        "disabled:bg-secondary-disabled disabled:opacity-50",
      ],
      variant === "accent" && [
        "font-roboto-mono",
        "font-normal",
        "bg-primary text-black",
        "hover:bg-accent-hover",
        "active:bg-accent-active",
        "disabled:bg-accent-disabled disabled:opacity-50",
      ],
      variant === "detail" && [
        "font-roboto-mono",
        "bg-background-secondary text-white",
        "hover:bg-background-secondary-hover",
        "active:bg-background-secondary-active",
        "disabled:bg-background-secondary disabled:opacity-50",
      ],
      variant === "primary-outline" && [
        "font-roboto-mono",
        "font-normal",
        "text-white",
        "border border-primary bg-transparent",
        "hover:bg-primary-hover hover:text-white",
        "active:border-primary-active active:bg-primary-active",
        "disabled:border-primary-disabled disabled:opacity-30",
      ],
      variant === "outline" && [
        "font-roboto-mono",
        "border border-gray-600 bg-transparent text-zinc-400",
        "hover:bg-gray-700 hover:text-white",
        "active:border-gray-800 active:bg-gray-800",
        "disabled:border-gray-500 disabled:opacity-30",
      ],
      variant === "confirmed" && ["cursor-default bg-emerald-500 text-white"],
      "disabled:cursor-not-allowed",
      isLoading &&
        "relative text-transparent transition-none hover:text-transparent disabled:cursor-wait",
      className,
    );

    function ChildrenContent() {
      return (
        <>
          {isLoading && (
            <div
              className={cn(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                {
                  "text-[#070707]": variant === "primary",
                  "text-white": ["secondary", "detail", "confirmed"].includes(
                    variant,
                  ),
                  "text-zinc-400": variant === "outline",
                },
              )}
            >
              <FaArrowsRotate className="animate-spin" />
            </div>
          )}
          {LeftIcon && (
            <div
              className={cn(
                size === "base" && "mr-1",
                size === "sm" && "mr-1.5",
              )}
            >
              <LeftIcon
                width={16}
                height={16}
                className={cn(
                  size === "base" && "text-md md:text-md",
                  size === "sm" && "md:text-md text-sm",
                  classNames?.leftIcon,
                )}
              />
            </div>
          )}
          {children}
          {RightIcon && (
            <div
              className={cn(
                size === "base" && "ml-1",
                size === "sm" && "ml-1.5",
              )}
            >
              <RightIcon
                width={16}
                height={16}
                className={cn(
                  size === "base" && "text-md md:text-md",
                  size === "sm" && "md:text-md text-sm",
                  classNames?.rightIcon,
                )}
              />
            </div>
          )}
        </>
      );
    }
    return href ? (
      <Link href={href} className={style}>
        <ChildrenContent />
      </Link>
    ) : (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        {...rest}
        className={style}
      >
        <ChildrenContent />
      </button>
    );
  },
);
