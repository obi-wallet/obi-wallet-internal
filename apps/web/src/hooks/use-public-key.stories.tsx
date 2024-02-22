import { usePublicKeyQuery } from "@/hooks/use-public-key";
import {
  ProviderWithWallet,
  UnitTest,
  unitTestPlay,
} from "@/storybook-helpers";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Unit Tests/use-public-key",
  component: UnitTest,
} satisfies Meta<typeof UnitTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UsePublicKeyQuery: Story = {
  args: {},
  decorators: [
    (Story) => {
      return (
        <ProviderWithWallet>
          <Story />
        </ProviderWithWallet>
      );
    },
  ],
  render: function UsePublicKeyQueryTest() {
    const publicKey = usePublicKeyQuery();
    return (
      <UnitTest done={!publicKey.isLoading} success={publicKey.isSuccess} />
    );
  },
  play: unitTestPlay,
};
