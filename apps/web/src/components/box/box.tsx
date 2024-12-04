import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import { IconType } from "react-icons";

import { Text } from "../text/text";

type BoxProps = {
  title?: string | undefined;
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
      className={cn(
        "obi-box bg-background-secondary rounded-md sm:shadow",
        className,
      )}
      {...rest}
    >
      {title && (
        <Text className={cn("obi-box-title", titleClassName)}>{title}</Text>
      )}
      {RightIcon && <RightIcon className="obi-box-icon" />}
      <div className="obi-box-content">{children}</div>
    </div>
  );
}
