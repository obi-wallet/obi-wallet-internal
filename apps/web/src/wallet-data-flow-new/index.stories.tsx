import { WalletDataFlow } from "@/wallet-data-flow-new";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  // TODO: handle missing ed25510 key pair in WalletDataFlow
  title: "WalletDataFlowNew",
  component: WalletDataFlow,
  tags: ["autodocs"],
  decorators: [],
} satisfies Meta<typeof WalletDataFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {
  args: {
    // homeChainId: SecretJsHomeChainId.MAINNET,
    // initialValues: {},
    // onDone,
    // onBack,
  },
};
