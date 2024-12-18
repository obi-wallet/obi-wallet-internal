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
  | "primary-outline"
  | "warning";

export type ButtonSize = "sm" | "base" | "md" | "lg" | "tall";

export type ButtonLeading = "none" | "tight" | "normal";

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
  leading?: ButtonLeading;
  textAlign?: "left" | "center" | "justify";
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
      leading = "tight",
      textAlign = "center",
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
      "inline-flex rounded-[5px] items-center font-medium",
      "focus-visible:ring focus:outline-none focus-visible:ring-primary",
      "shadow-sm",
      "transition-colors duration-75",
      "disabled:shadow-inner",
      block && "w-full",
      // Size
      size === "base" &&
        "px-3 py-1.5 text-sm md:text-base h-standardButton max-h-standardButton",
      size === "sm" &&
        "px-1 py-1 text-xs md:text-sm h-standardButton max-h-standardButton",
      size === "md" &&
        "px-3 md:text-sm lg:text-md lg:py-1.5 max-md:py-1 max-sm:text-xs h-standardButton max-h-standardButton",
      size === "tall" &&
        "px-3 py-2 text-sm md:text-base h-tallButton max-h-tallButton",
      // size === "lg" && "h-12 px-6 text-base",
      // Line Height (Leading)
      leading === "tight" &&
        "leading-tight md:leading-tight sm:leading-tight lg:leading-tight",
      leading === "normal" &&
        "leading-normal md:leading-normal sm:leading-normal lg:leading-normal",
      leading === "none" &&
        "leading-none md:leading-none sm:leading-none lg:leading-none",
      // Variants
      variant === "primary" && [
        "",
        "bg-primary text-[#070707]",
        "hover:bg-primary-hover",
        "active:bg-primary-active",
        "disabled:bg-primary-disabled disabled:opacity-30",
      ],
      variant === "secondary" && [
        "",
        "bg-secondary text-white",
        "hover:bg-secondary-hover",
        "active:bg-secondary-active",
        "disabled:bg-secondary-disabled disabled:opacity-50",
      ],
      variant === "accent" && [
        "",
        "font-normal",
        "bg-primary text-black",
        "hover:bg-accent-hover",
        "active:bg-accent-active",
        "disabled:bg-accent-disabled disabled:opacity-50",
      ],
      variant === "detail" && [
        "",
        "bg-background-secondary text-white",
        "hover:bg-background-secondary-hover",
        "active:bg-background-secondary-active",
        "disabled:bg-background-secondary disabled:opacity-50",
      ],
      variant === "primary-outline" && [
        "",
        "font-normal",
        "text-white",
        "border border-primary bg-transparent",
        "hover:bg-primary-hover hover:text-white",
        "active:border-primary-active active:bg-primary-active",
        "disabled:border-primary-disabled disabled:opacity-30",
      ],
      variant === "warning" && [
        "",
        "font-normal",
        "text-black",
        "bg-[color:var(--background-warning)]",
        "disabled:opacity-30",
      ],
      variant === "outline" && [
        "",
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
        <div
          className={cn(
            "flex min-h-full w-full items-center",
            textAlign === "left" && "justify-start text-left",
            textAlign === "center" && "justify-center text-center",
            textAlign === "justify" && "justify-between",
          )}
        >
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
        </div>
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
