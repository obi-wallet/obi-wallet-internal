import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentPropsWithRef, forwardRef } from "react";
import { IconType } from "react-icons";
import { FaArrowsRotate } from "react-icons/fa6";

const ButtonVariant = ["primary", "outline", "confirmed", "secondary"] as const;
const ButtonSize = ["sm", "base"] as const;

type ButtonProps = {
  isLoading?: boolean;
  isDarkBg?: boolean;
  variant?: (typeof ButtonVariant)[number];
  size?: (typeof ButtonSize)[number];
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
  // eslint-disable-next-line mobx/missing-observer
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
    },
    ref,
  ) {
    const disabled = isLoading || buttonDisabled;

    const style = cn(
      "inline-flex items-center rounded font-medium",
      "focus-visible:ring-primary-500 focus:outline-none focus-visible:ring",
      "shadow-sm",
      "transition-colors duration-75",
      "disabled:shadow-inner",
      [block && "w-full justify-center"],
      //#region  //*=========== Size ===========
      [size === "base" && ["px-3 py-3.5", "text-sm "]],
      //#endregion  //*======== Size ===========
      //#region  //*=========== Variants ===========
      [
        variant === "primary" && [
          "border border-blue-600 bg-blue-600 text-white shadow",
          "hover:border-blue-700 hover:bg-blue-700",
          "active:bg-blue-800 active:hover:border-blue-800",
          "disabled:border-blue-600 disabled:bg-blue-600 disabled:opacity-30",
        ],
        variant === "secondary" && [
          "border border-gray-700 bg-gray-700 text-white shadow",
          "hover:border-gray-800 hover:bg-gray-800 ",
          "active:bg-gray-950 active:hover:border-gray-950",
          "disabled:border-gray-700 disabled:bg-gray-700 disabled:opacity-50",
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

    const ChildrenContent = () => (
      <>
        {isLoading && (
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              {
                "text-white": ["primary", "dark"].includes(variant),
                "text-black": ["light"].includes(variant),
                "text-primary-500": ["outline", "ghost"].includes(variant),
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
