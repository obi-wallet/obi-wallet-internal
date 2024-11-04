import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentPropsWithRef, forwardRef, ReactNode } from "react";

export type UnstyledLinkProps = {
  href: string;
  children: ReactNode;
  openNewTab?: boolean;
  className?: string;
} & ComponentPropsWithRef<"a">;

export const UnstyledLink = forwardRef<HTMLAnchorElement, UnstyledLinkProps>(
  function UnstyledLink(
    { children, href, openNewTab, className, ...rest }: UnstyledLinkProps,
    ref,
  ) {
    const isNewTab =
      openNewTab !== undefined
        ? openNewTab
        : href && !href.startsWith("/") && !href.startsWith("#");

    if (!isNewTab) {
      return (
        // @ts-expect-error This is only an `exactOptionalPropertyTypes` error in third-party types
        <Link href={href} ref={ref} className={className} {...rest}>
          {children}
        </Link>
      );
    }

    return (
      <a
        ref={ref}
        target="_blank"
        rel="noopener noreferrer"
        href={href}
        {...rest}
        className={cn("cursor-newtab", className)}
      >
        {children}
      </a>
    );
  },
);
