import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import { IconType } from "react-icons";

import { Text } from "../text/text";

type BoxProps = {
  title?: string;
  RightIcon?: IconType;
  titleClassName?: string;
} & ComponentPropsWithoutRef<"div">;

export function Box({
  title,
  RightIcon,
  className,
  children,
  titleClassName,
  ...rest
}: BoxProps) {
  return (
    <div
      className={cn("bg-background-secondary rounded-md p-4 shadow", className)}
      {...rest}
    >
      {title && <Text className={titleClassName}>{title}</Text>}
      {RightIcon && <RightIcon />}
      {children}
    </div>
  );
}
