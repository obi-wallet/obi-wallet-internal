import { Text } from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

import { Provider } from "../provider";

const meta: Meta<typeof Text> = {
  title: "common/Text",
  component: Text,
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Primary: Story = {
  render: () => (
    <Provider>
      <Text>Hello World</Text>
    </Provider>
  ),
};
