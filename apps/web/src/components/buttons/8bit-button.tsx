import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentPropsWithRef, forwardRef } from "react";

type ButtonProps = ComponentPropsWithRef<"button"> & ComponentPropsWithRef<"a">;

export const BitButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, className, href, ...rest }: ButtonProps, ref) {
    const style = cn(
      "cursor-pointer text-2xl text-white opacity-60",
      "hover:opacity-100",
      "before:content-['>'] before:absolute before:-left-8 before:hidden hover:before:flex",
      className,
    );

    return (
      <div className="relative">
        {href ? (
          // @ts-expect-error This is only an `exactOptionalPropertyTypes` error in third-party types
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
