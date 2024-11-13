import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { providerWithWalletDecorator } from "@/storybook-helpers";
import { MultisigKey } from "@obi-wallet/sdk";
import type { Meta, StoryObj } from "@storybook/react";

import { ApproveIntentions } from ".";

const meta = {
  title: "User Interactions/Approve Intentions",
  component: ApproveIntentions,
  decorators: [providerWithWalletDecorator],
} satisfies Meta<typeof ApproveIntentions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignOnly: Story = {
  args: {
    multisigKey: MultisigKey.create(
      MOCK_WALLET_DATA.homeChain,
      MOCK_WALLET_DATA.owner,
    ),
    keyMetaData: {},
    intentions: {
      signHashes: [new Uint8Array(32)],
      decryptEasyShare: null,
      decryptMessages: [],
      decryptPrimaryKeyEncryptedMessages: [],
      decryptMultisigKeyEncryptedMessages: [],
    },
    onApprove: async () => {},
  },
};

export const DecryptOnly: Story = {
  args: {
    multisigKey: MultisigKey.create(
      MOCK_WALLET_DATA.homeChain,
      MOCK_WALLET_DATA.owner,
    ),
    keyMetaData: {},
    intentions: {
      signHashes: [],
      decryptEasyShare: null,
      decryptMessages: [],
      decryptPrimaryKeyEncryptedMessages: [],
      decryptMultisigKeyEncryptedMessages: [],
    },
    onApprove: async () => {},
  },
};
