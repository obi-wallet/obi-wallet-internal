import { cn } from "@/lib/utils";
import { IColors, ISizes } from "@/types/styles";
import { IFontWeights } from "@/types/styles";
import { ILeadings } from "@/types/styles";
import { ReactNode } from "react";

export type TypographyProps = {
  mono?: boolean;
  size?: ISizes;
  color?: IColors;
  fontWeight?: IFontWeights;
  leading?: ILeadings;
  tracking?: boolean;
  uppercase?: boolean;
  className?: string;
  children?: ReactNode;
};

export function Text({
  mono = false,
  size = "md",
  color = "white",
  fontWeight = "normal",
  leading = "none",
  tracking = false,
  uppercase = false,
  className,
  children,
}: TypographyProps) {
  return (
    <span
      className={cn(
        "flex items-center",
        color === "white" && "text-white",
        color === "black" && "text-black",
        color === "gray" && "text-neutral-500",
        color === "dark-gray" && "text-neutral-700",
        color === "orange" && "text-orange-600",
        color === "light-orange" && "text-orange-400",
        color === "blue" && "text-blue-800",
        color === "sky" && "text-sky-800",
        color === "lime" && "text-lime-600",
        color === "red" && "text-red-600",
        color === "zinc" && "text-zinc-400",
        size === "xs" && "text-xs",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg",
        size === "xl" && "text-xl",
        size === "2xl" && "text-2xl",
        size === "3xl" && "text-3xl",
        fontWeight === "normal" && "font-normal",
        fontWeight === "medium" && "font-medium",
        fontWeight === "semibold" && "font-semibold",
        fontWeight === "bold" && "font-bold",
        leading === "none" && "leading-none",
        leading === "tight" && "leading-tight",
        leading === "snug" && "leading-snug",
        leading === "normal" && "leading-normal",
        leading === "relaxed" && "leading-relaxed",
        leading === "loose" && "leading-loose",
        tracking && "tracking-widest",
        uppercase && "uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
