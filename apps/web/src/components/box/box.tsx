import * as React from "react";

import { cn } from "@/lib/utils";
import { IconType } from "react-icons";
import { Text } from "../text/text";

type BoxProps = {
  title?: string;
  RightIcon?: IconType;
} & React.ComponentPropsWithoutRef<"div">;

export const Box = ({ title, RightIcon, className, ...rest }: BoxProps) => {
  return (
    <div
      className={cn("rounded-md bg-slate-900 p-4 shadow", className)}
      {...rest}
    >
      {title && <Text>{title}</Text>}
      {RightIcon && <RightIcon />}
    </div>
  );
};
