import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { providerWithWalletDecorator } from "@/storybook-helpers";
import { dashboardLayoutDecorator } from "@/storybook-helpers/layouts";
import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import type { Meta, StoryObj } from "@storybook/react";

import { SignAndBroadcastTransactionUserInteractionHandlerInner } from "./sign-and-broadcast-transaction-handler";

const meta = {
  title: "User Interactions/SignAndBroadcastTransactionHandlerInner",
  component: SignAndBroadcastTransactionUserInteractionHandlerInner,
  tags: ["autodocs"],
  decorators: [dashboardLayoutDecorator, providerWithWalletDecorator],
} satisfies Meta<typeof SignAndBroadcastTransactionUserInteractionHandlerInner>;

export default meta;
type Story = StoryObj<typeof meta>;

const sendMessage = {
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

const interaction: SignAndBroadcastTransactionUserInteraction = {
  payload: {
    messages: [sendMessage],
    memo: "",
    mockOnly: true,
    cancelable: true,
    targetChainId: CosmosSdkChainId.Sei,
    walletMeta: {
      userEntryAddress: MOCK_WALLET_DATA.userEntryAddress,
    },
  },
  resolve: () => {},
  reject: () => {},
};

export const SendMessage: Story = {
  args: {
    interaction,
  },
};
