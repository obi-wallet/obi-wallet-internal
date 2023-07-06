import { Alert, Lookup } from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

function mockAction(message: string) {
  return () => {
    Alert.alert(message);
  };
}

const meta: Meta<typeof Lookup> = {
  title: "common/Lookup",
  component: Lookup,
};

export default meta;

type Story = StoryObj<typeof Lookup>;

export const Primary: Story = {
  render: () => {
    return (
      <Lookup
        chainId="phoenix-1"
        publicKey="AlLObpH8f6ea7ogc32Jpc2aLcZi3/O0K8zXw7OkZCA98"
        onSelect={async () => {
          mockAction("onSelect");
        }}
        onCancel={mockAction("onCancel")}
      />
    );
  },
};
