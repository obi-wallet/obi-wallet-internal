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
  | "detail";

export type ButtonSize = "sm" | "base";

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
} & ComponentPropsWithRef<"button"> &
  ComponentPropsWithRef<"a">;

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
      "inline-flex items-center rounded font-medium text-center",
      "focus-visible:ring-primary-500 focus:outline-none focus-visible:ring",
      "shadow-sm",
      "transition-colors duration-75",
      "disabled:shadow-inner",
      [block && "w-full justify-center"],
      //#region  //*=========== Size ===========
      [size === "base" && ["px-3 py-3.5", "text-sm md:text-base"]],
      [size === "sm" && ["px-1 py-1", "text-xs md:text-sm"]],
      //#endregion  //*======== Size ===========
      //#region  //*=========== Variants ===========
      [
        variant === "primary" && [
          "border border-background-primary bg-background-primary text-white shadow",
          "hover:border-background-primary-hover hover:bg-background-primary-hover",
          "active:border-background-primary-active active:hover:border-background-primary-active active:bg-background-primary-active",
          "disabled:border-background-primary-disabled disabled:bg-background-primary-disabled disabled:opacity-30",
        ],
        variant === "secondary" && [
          "border border-background-select bg-background-select text-white shadow",
          "hover:border-background-select-hover hover:bg-background-select-hover",
          "active:bg-background-select-active active:hover:border-background-select-active",
          "disabled:border-gray-700 disabled:bg-gray-700 disabled:opacity-50",
        ],
        variant === "detail" && [
          "border border-indigo-950 bg-indigo-950 text-white shadow",
          "hover:border-indigo-800 hover:bg-indigo-800",
          "active:bg-indigo-700 active:hover:border-indigo-700",
          "disabled:border-indigo-950 disabled:bg-indigo-950 disabled:opacity-50",
        ],
        variant === "outline" && [
          "border border-gray-600 bg-transparent text-zinc-400",
          "hover:bg-gray-700 hover:text-white",
          "active:border-gray-800 active:bg-gray-800",
          "disabled:border-gray-500 disabled:opacity-30",
        ],
        variant === "confirmed" && [
          "cursor-default border border-emerald-500 bg-emerald-500 text-white",
        ],
      ],
      //#endregion  //*======== Variants ===========
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
                  "text-white": [
                    "primary",
                    "secondary",
                    "detail",
                    "confirmed",
                  ].includes(variant),
                  "text-zinc-400": ["outline"].includes(variant),
                },
              )}
            >
              <FaArrowsRotate className="animate-spin" />
            </div>
          )}
          {LeftIcon && (
            <div
              className={cn([
                size === "base" && "mr-1",
                size === "sm" && "mr-1.5",
              ])}
            >
              <LeftIcon
                width={16}
                height={16}
                className={cn(
                  [
                    size === "base" && "md:text-md text-md",
                    size === "sm" && "md:text-md text-sm",
                  ],
                  classNames?.leftIcon,
                )}
              />
            </div>
          )}
          {children}
          {RightIcon && (
            <div
              className={cn([
                size === "base" && "ml-1",
                size === "sm" && "ml-1.5",
              ])}
            >
              <RightIcon
                width={16}
                height={16}
                className={cn(
                  [
                    size === "base" && "text-md md:text-md",
                    size === "sm" && "md:text-md text-sm",
                  ],
                  classNames?.rightIcon,
                )}
              />
            </div>
          )}
        </>
      );
    }

    return href ? (
      <Link href={href} className={style} {...rest}>
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
