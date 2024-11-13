import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { providerWithWalletDecorator } from "@/storybook-helpers";
import { CosmosChainId } from "@/target-chain/cosmos/chains";
import { SecretChainId } from "@/target-chain/secret/chains";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import type { Meta, StoryObj } from "@storybook/react";
import { MsgSend } from "secretjs";

import { SignAndBroadcastTransactionUserInteractionHandlerInner } from "./sign-and-broadcast-transaction-handler";

const meta = {
  title: "User Interactions/SignAndBroadcastTransactionHandlerInner",
  component: SignAndBroadcastTransactionUserInteractionHandlerInner,
  decorators: [providerWithWalletDecorator],
} satisfies Meta<typeof SignAndBroadcastTransactionUserInteractionHandlerInner>;

export default meta;
type Story = StoryObj<typeof meta>;

const sendMessageCosmos = {
  typeUrl: "/cosmos.bank.v1beta1.MsgSend",
  value: {
    fromAddress: "sei1kvjg92ldmughvhcynu72ef3zjgrx9rdkdct83l",
    toAddress: "sei1kvjg92ldmughvhcynu72ef3zjgrx9rdkdct83l",
    amount: [
      {
        denom: "usei",
        amount: "1000000",
      },
    ],
  },
};

const interactionCosmos: SignAndBroadcastTransactionUserInteraction = {
  payload: {
    messages: [sendMessageCosmos],
    memo: "a memo",
    mockOnly: true,
    cancelable: true,
    targetChainId: CosmosChainId.Sei,
    walletMeta: {
      userEntryAddress: MOCK_WALLET_DATA.userEntryAddress,
    },
  },
  resolve: () => {},
  reject: () => {},
};

export const SendMessageCosmos: Story = {
  args: {
    interaction: interactionCosmos,
  },
};

const sendMessageSecret = new MsgSend({
  from_address: "secret1kvjg92ldmughvhcynu72ef3zjgrx9rdkz3wc2z",
  to_address: "secret1kvjg92ldmughvhcynu72ef3zjgrx9rdkz3wc2z",
  amount: [
    {
      denom: "uscrt",
      amount: "1",
    },
  ],
});

const interactionSecret: SignAndBroadcastTransactionUserInteraction = {
  payload: {
    messages: [sendMessageSecret],
    memo: "a memo",
    mockOnly: true,
    cancelable: true,
    targetChainId: SecretChainId.Secret,
    walletMeta: {
      userEntryAddress: MOCK_WALLET_DATA.userEntryAddress,
    },
  },
  resolve: () => {},
  reject: () => {},
};

export const SendMessageSecret: Story = {
  args: {
    interaction: interactionSecret,
  },
};
