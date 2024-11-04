import { dashboardLayoutDecorator } from "@/storybook-helpers/layouts";
import type { Meta, StoryObj } from "@storybook/react";

import { BaseInput } from "./base-input";

const meta = {
  title: "UI/BaseInput",
  component: BaseInput,
  parameters: {
    layout: "centered",
  },
  decorators: [dashboardLayoutDecorator],
  argTypes: {
    placeholder: { type: "string" },
  },
} satisfies Meta<typeof BaseInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    placeholder: "Placeholder",
  },
};
