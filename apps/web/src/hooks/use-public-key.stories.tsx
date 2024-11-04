import { useSecp256k1PublicKeyQuery } from "@/hooks/use-public-key";
import {
  AutomatedTest,
  automatedTestPlay,
  providerWithWalletDecorator,
} from "@/storybook-helpers";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Tests/hooks/balances/use-public-key",
  component: AutomatedTest,
} satisfies Meta<typeof AutomatedTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UsePublicKeyQuery: Story = {
  name: "usePublicKeyQuery",
  decorators: [providerWithWalletDecorator],
  render: function UsePublicKeyQueryTest() {
    const publicKey = useSecp256k1PublicKeyQuery();
    return (
      <AutomatedTest
        done={!publicKey.isLoading}
        success={publicKey.isSuccess}
      />
    );
  },
  play: automatedTestPlay,
};
