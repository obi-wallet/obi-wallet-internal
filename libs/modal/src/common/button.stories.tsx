import { Button } from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

import { Provider } from "../provider";

const meta: Meta<typeof Button> = {
  title: "common/Button",
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  render: () => (
    <Provider>
      <Button label="Test" flavor="blue" />
    </Provider>
  ),
};
