import { cn } from "@/lib/utils";
import { ComponentPropsWithRef, forwardRef } from "react";
import { IconType } from "react-icons";
import { FaArrowsRotate } from "react-icons/fa6";

const IconButtonVariant = ["primary", "outline", "confirmed"] as const;

type IconButtonProps = {
  isLoading?: boolean;
  isDarkBg?: boolean;
  variant?: (typeof IconButtonVariant)[number];
  icon?: IconType;
  classNames?: {
    icon?: string;
  };
} & ComponentPropsWithRef<"button">;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  // eslint-disable-next-line mobx/missing-observer
  function IconButton(
    {
      className,
      disabled: buttonDisabled,
      isLoading,
      variant = "primary",
      icon: Icon,
      classNames,
      children,
      ...rest
    },
    ref,
  ) {
    const disabled = isLoading || buttonDisabled;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded font-medium",
          "focus-visible:ring-primary-500 focus:outline-none focus-visible:ring",
          "shadow-sm",
          "transition-colors duration-75",
          "min-h-[28px] min-w-[28px] p-1 md:min-h-[34px] md:min-w-[34px] md:p-2",
          //#region  //*=========== Variants ===========
          [
            variant === "primary" && [
              "border border-blue-600 bg-blue-600 text-white shadow",
              "hover:bg-blue-700 hover:text-white",
              "active:bg-blue-800",
              "disabled:opacity-30",
              "disabled:border-blue-600 disabled:bg-blue-600",
            ],
            variant === "outline" && [
              "border border-gray-600 bg-transparent text-zinc-400",
              "hover:bg-gray-700 hover:text-white",
              "active:bg-gray-800",
              "disabled:opacity-30",
              "disabled:border-gray-900 disabled:bg-gray-900",
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
        )}
        {...rest}
      >
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
        {Icon && (
          <Icon
            width={16}
            height={16}
            className={cn(classNames?.icon, "mr-2")}
          />
        )}
        {children}
      </button>
    );
  },
);
