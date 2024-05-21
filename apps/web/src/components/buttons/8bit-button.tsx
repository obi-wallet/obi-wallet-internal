import { ComponentPropsWithRef, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentPropsWithRef<"button"> & ComponentPropsWithRef<"a">;

export const BitButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { children, className, disabled: buttonDisabled, href, ...rest },
    ref,
  ) {
    const style = cn(
      "font-PressStart2P cursor-pointer text-2xl text-white opacity-60",
      "hover:opacity-100",
      "before:content-['>'] before:absolute before:-left-8 before:hidden hover:before:flex",
      className,
    );

    return (
      <div className="relative">
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
