import { usePublicKeyQuery } from "@/hooks/use-public-key";
import {
  ProviderWithWallet,
  AutomatedTest,
  automatedTestPlay,
} from "@/storybook-helpers";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Tests/use-public-key",
  component: AutomatedTest,
} satisfies Meta<typeof AutomatedTest>;

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
      <AutomatedTest
        done={!publicKey.isLoading}
        success={publicKey.isSuccess}
      />
    );
  },
  play: automatedTestPlay,
};
