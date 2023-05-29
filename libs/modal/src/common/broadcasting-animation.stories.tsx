import { BroadcastingAnimation } from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof BroadcastingAnimation> = {
  title: "common/BroadcastingAnimation",
  component: BroadcastingAnimation,
};

export default meta;

type Story = StoryObj<typeof BroadcastingAnimation>;

export const Primary: Story = {
  render: () => {
    return <BroadcastingAnimation />;
  },
};
