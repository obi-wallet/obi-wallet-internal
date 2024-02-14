import type { Meta, StoryObj } from "@storybook/react";

import { BalanceInput } from ".";

const meta = {
  title: "UI/Balance Input",
  component: BalanceInput,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "obi",
      values: [{ name: "obi", value: "#0F0F26" }],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: { type: "string" },
  },
} satisfies Meta<typeof BalanceInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    placeholder: "Placeholder",
  },
};
