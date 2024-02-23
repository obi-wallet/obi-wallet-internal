import {
  AutomatedTest,
  automatedTestPlay,
  providerWithWalletDecorator,
} from "@/storybook-helpers";
import { usePublicKeyKnownCheck } from "@/wallet-health/checks";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Tests/wallet-health/checks",
  component: AutomatedTest,
} satisfies Meta<typeof AutomatedTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UsePublicKeyKnownCheck: Story = {
  name: "usePublicKeyKnownCheck",
  decorators: [providerWithWalletDecorator],
  render: function UsePublicKeyKnownCheckTest() {
    const check = usePublicKeyKnownCheck();
    return (
      <AutomatedTest
        done={!check.query.isLoading}
        success={check.query.isSuccess && !!check.query.data}
      />
    );
  },
  play: automatedTestPlay,
};
