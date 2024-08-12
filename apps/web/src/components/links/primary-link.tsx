import {
  UnstyledLink,
  UnstyledLinkProps,
} from "@/components/links/unstyled-link";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type PrimaryLinkVariant = "primary" | "basic";
type PrimaryLinkProps = {
  variant?: PrimaryLinkVariant;
} & UnstyledLinkProps;

export const PrimaryLink = forwardRef<HTMLAnchorElement, PrimaryLinkProps>(
  function PrimaryLink(
    { className, children, variant = "primary", ...rest }: PrimaryLinkProps,
    ref,
  ) {
    return (
      <UnstyledLink
        ref={ref}
        {...rest}
        className={cn(
          "inline-flex items-center",
          "focus-visible:ring-primary-500 focus:outline-none focus-visible:rounded focus-visible:ring focus-visible:ring-offset-2",
          "font-medium",
          //#region  //*=========== Variant ===========
          variant === "primary" && [
            "text-primary-500 hover:text-primary-600 active:text-primary-700",
            "disabled:text-primary-200",
          ],
          variant === "basic" && [
            "text-black hover:text-gray-600 active:text-gray-800",
            "disabled:text-gray-300",
          ],
          //#endregion  //*======== Variant ===========
          className,
        )}
      >
        {children}
      </UnstyledLink>
    );
  },
);
