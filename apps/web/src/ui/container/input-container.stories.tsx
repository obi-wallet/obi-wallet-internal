import { dashboardLayoutDecorator } from "@/storybook-helpers/layouts";
import type { Meta, StoryObj } from "@storybook/react";

import { InputContainer } from ".";

const meta = {
  title: "UI/Container",
  component: InputContainer,
  parameters: {
    layout: "centered",
  },
  decorators: [dashboardLayoutDecorator],
  tags: ["autodocs"],
  argTypes: {
    label: { type: "string" },
    labelClassname: {
      type: "string",
      description:
        "Additional classes for the label. To display the label correctly, it is required to pass the background, such as `bg-black`",
      options: ["bg-violet-600", "bg-black"],
      control: { type: "select" },
    },
  },
} satisfies Meta<typeof InputContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div>InputContainer</div>,
    labelClassname: "",
  },
};

export const WithChildrenAndLabel: Story = {
  args: {
    children: <div>InputContainer</div>,
    label: "Label",
    labelClassname: "bg-violet-600",
  },

  render: (args) => (
    <InputContainer {...args}>
      <div>InputContainer</div>
    </InputContainer>
  ),
};
