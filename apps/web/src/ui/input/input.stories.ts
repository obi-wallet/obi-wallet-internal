import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: { type: "string" },
    labelClassname: {
      type: "string",
      description:
        "Additional classes for the label. To display the label correctly, it is required to pass the background, such as `bg-black`",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: "Label",
    labelClassname: "bg-black",
  },
};
