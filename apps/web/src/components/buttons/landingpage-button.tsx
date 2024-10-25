import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentPropsWithRef, forwardRef } from "react";

type ButtonProps = ComponentPropsWithRef<"button"> & ComponentPropsWithRef<"a">;

export const LandingPageButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, className, href, ...rest }: ButtonProps, ref) {
    const style = cn(
      "font-press-start-2p cursor-pointer opacity-100 px-5 py-2 lg:px-10 lg:py-4 text-sm lg:text-xl",
      "hover:opacity-80",
      // "before:content-['>'] before:absolute before:-left-8 before:hidden hover:before:flex",
      className,
    );

    return (
      <div className="flex justify-center">
        {href ? (
          <Link href={href} className={style} {...rest}>
            {children}
          </Link>
        ) : (
          <button ref={ref} type="button" {...rest} className={style}>
            {children}
          </button>
        )}
      </div>
    );
  },
);