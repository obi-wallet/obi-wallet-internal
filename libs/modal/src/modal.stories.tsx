import type { Meta, StoryObj } from "@storybook/react";

import { ModalWithoutProvider } from "./modal";

const meta: Meta<typeof ModalWithoutProvider> = {
  title: "Modal",
  component: ModalWithoutProvider,
};

export default meta;

type Story = StoryObj<typeof ModalWithoutProvider>;

export const Primary: Story = {
  render: () => <ModalWithoutProvider />,
};

export const Themes: Story = {
  render: () => <ModalWithoutProvider />,
};
