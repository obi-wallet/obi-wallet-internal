import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import { IconType } from "react-icons";

import { Text } from "../text/text";

type BoxProps = {
  title?: string;
  RightIcon?: IconType;
} & ComponentPropsWithoutRef<"div">;

export function Box({
  title,
  RightIcon,
  className,
  children,
  ...rest
}: BoxProps) {
  return (
    <div
      className={cn("rounded-md bg-slate-900 p-4 shadow", className)}
      {...rest}
    >
      {title && <Text>{title}</Text>}
      {RightIcon && <RightIcon />}
      {children}
    </div>
  );
}
