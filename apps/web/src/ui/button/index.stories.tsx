import { Button } from "@/components";
import { Meta, StoryObj } from "@storybook/react";
import { xprod } from "ramda";

import { AsyncButton } from ".";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
  render: () => {
    const variants = [
      "primary",
      "outline",
      "confirmed",
      "secondary",
      "detail",
    ] as const;
    const sizes = ["sm", "base"] as const;

    return (
      <>
        {xprod(variants, sizes).map(([variant, size]) => {
          return (
            <div key={`${variant}-${size}`}>
              <Button variant={variant} size={size}>
                {variant} {size}
              </Button>
            </div>
          );
        })}
      </>
    );
  },
};

export const AsyncButtons: Story = {
  render: () => {
    const variants = [
      "primary",
      "outline",
      "confirmed",
      "secondary",
      "detail",
    ] as const;
    const sizes = ["sm", "base"] as const;

    return (
      <>
        {xprod(variants, sizes).map(([variant, size]) => {
          return (
            <div key={`${variant}-${size}`}>
              <AsyncButton
                variant={variant}
                size={size}
                onClick={async () => {
                  await new Promise((resolve) => {
                    return setTimeout(resolve, 2000);
                  });
                }}
              >
                {variant} {size}
              </AsyncButton>
              <AsyncButton
                variant={variant}
                size={size}
                isLoading
                onClick={async () => {
                  await new Promise((resolve) => {
                    return setTimeout(resolve, 2000);
                  });
                }}
              >
                {variant} {size}
              </AsyncButton>
            </div>
          );
        })}
      </>
    );
  },
};
