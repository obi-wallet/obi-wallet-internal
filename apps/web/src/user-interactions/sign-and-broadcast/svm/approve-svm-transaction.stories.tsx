import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { providerWithWalletDecorator } from "@/storybook-helpers";
import { TargetChain } from "@/target-chain";
import { SolanaChainId } from "@/target-chain/solana/chains";
import { Meta, StoryObj } from "@storybook/react";

import { ApproveSvmTransaction } from "./approve-svm-transaction";

const meta = {
  title: "User Interactions/Approve SVM Transaction",
  component: ApproveSvmTransaction,
  decorators: [providerWithWalletDecorator],
} satisfies Meta<typeof ApproveSvmTransaction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SendMessage: Story = {
  args: {
    walletMeta: {
      userEntryAddress: MOCK_WALLET_DATA.userEntryAddress,
    },
    targetChainId: SolanaChainId.Devnet,
    message: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      fromAddress: MOCK_WALLET_DATA.ed25519KeyPair?.publicKey!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      toAddress: MOCK_WALLET_DATA.ed25519KeyPair?.publicKey!,
      rawAmount: "1000000000",
      id: TargetChain.chainId(SolanaChainId.Devnet).nativeCaip19AssetId,
    },
    onReject: () => {},
    onApprove: async () => {
      console.log("approved");
    },
  },
};
