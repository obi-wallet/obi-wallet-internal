import { Button, ButtonProps } from "@/components";
import { MouseEvent, useState } from "react";

export type AsyncButtonProps = Omit<ButtonProps, "href" | "onClick"> & {
  onClick: (
    e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLAnchorElement>,
  ) => Promise<void>;
};

export function AsyncButton(props: AsyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      {...props}
      isLoading={props.isLoading || isLoading}
      onClick={async (e) => {
        setIsLoading(true);
        try {
          await props.onClick(e);
        } finally {
          setIsLoading(false);
        }
      }}
    />
  );
}
