import {
  UnstyledLink,
  UnstyledLinkProps,
} from "@/components/links/unstyled-link";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { IconType } from "react-icons";

const ButtonLinkVariant = [
  "primary",
  "outline",
  "ghost",
  "light",
  "dark",
] as const;
const ButtonLinkSize = ["sm", "base"] as const;

type ButtonLinkProps = {
  variant?: (typeof ButtonLinkVariant)[number];
  size?: (typeof ButtonLinkSize)[number];
  leftIcon?: IconType;
  rightIcon?: IconType;
  classNames?: {
    leftIcon?: string;
    rightIcon?: string;
  };
} & UnstyledLinkProps;

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  // eslint-disable-next-line mobx/missing-observer
  function ButtonLink(
    {
      children,
      className,
      variant = "primary",
      size = "base",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      classNames,
      ...rest
    },
    ref,
  ) {
    return (
      <UnstyledLink
        ref={ref}
        {...rest}
        className={cn(
          "inline-flex items-center rounded text-center font-medium",
          "focus-visible:ring-primary-500 focus:outline-none focus-visible:ring",
          "shadow-sm",
          "transition-colors duration-75",
          //#region  //*=========== Size ===========
          [size === "base" && ["px-3 py-4", "text-sm md:text-base"]],
          //#endregion  //*======== Size ===========
          //#region  //*=========== Variants ===========
          [
            variant === "primary" && [
              "bg-blue-600 text-white",
              "hover:bg-blue-700 hover:text-white",
              "active:bg-blue-800",
              "disabled:bg-blue-900",
            ],
            variant === "outline" && [
              "border border-gray-600 bg-transparent text-zinc-400",
              "hover:bg-gray-700 hover:text-white",
              "active:bg-gray-800",
              "disabled:bg-gray-900",
            ],
          ],
          //#endregion  //*======== Variants ===========
          "disabled:cursor-not-allowed",
          className,
        )}
      >
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
      </UnstyledLink>
    );
  },
);
