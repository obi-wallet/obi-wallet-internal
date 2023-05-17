import { Text } from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Text> = {
  title: "Text",
  component: Text,
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Primary: Story = {
  render: () => <Text>Hello World</Text>,
};
