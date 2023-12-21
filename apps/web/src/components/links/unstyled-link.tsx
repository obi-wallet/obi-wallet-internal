import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import { ComponentPropsWithRef, forwardRef, ReactNode } from "react";

export type UnstyledLinkProps = {
  href: string;
  children: ReactNode;
  openNewTab?: boolean;
  className?: string;
  nextLinkProps?: Omit<LinkProps, "href">;
} & ComponentPropsWithRef<"a">;

export const UnstyledLink = forwardRef<HTMLAnchorElement, UnstyledLinkProps>(
  // eslint-disable-next-line mobx/missing-observer
  function UnstyledLink(
    { children, href, openNewTab, className, nextLinkProps, ...rest },
    ref,
  ) {
    const isNewTab =
      openNewTab !== undefined
        ? openNewTab
        : href && !href.startsWith("/") && !href.startsWith("#");

    if (!isNewTab) {
      return (
        <Link
          href={href}
          ref={ref}
          className={className}
          {...rest}
          {...nextLinkProps}
        >
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
