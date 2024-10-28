import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentPropsWithRef, forwardRef } from "react";

type LandingPageButtonProps = {
  colorScheme: "dark" | "light";
} & ComponentPropsWithRef<"button"> &
  ComponentPropsWithRef<"a">;

export const LandingPageButton = forwardRef<
  HTMLButtonElement,
  LandingPageButtonProps
>(function Button(
  { children, className, colorScheme, href, ...rest }: LandingPageButtonProps,
  ref,
) {
  const style = cn(
    "font-press-start-2p cursor-pointer opacity-100 px-5 py-2 lg:px-4 lg:py-4 text-sm text-center lg:text-xl w-52 lg:w-72",
    "hover:opacity-80",
    [colorScheme === "dark" && ["bg-sky-500 text-white"]],
    [colorScheme === "light" && ["bg-white text-sky-500"]],
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
});
