import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { providerWithWalletDecorator } from "@/storybook-helpers";
import { TargetChain } from "@/target-chain";
import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import type { Meta, StoryObj } from "@storybook/react";

import { ApproveMessages } from ".";

const meta = {
  title: "User Interactions/Approve Messages",
  component: ApproveMessages,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [providerWithWalletDecorator],
} satisfies Meta<typeof ApproveMessages>;

export default meta;
type Story = StoryObj<typeof meta>;

const sendMessage = {
  typeUrl: "/cosmos.bank.v1beta1.MsgSend",
  value: {
    fromAddress: "sei1rptyr50v9sdythznd46vvml5wpp3uzvhdyfwqf",
    toAddress: "sei1rptyr50v9sdythznd46vvml5wpp3uzvhdyfwqf",
    amount: [
      {
        denom: "usei",
        amount: "1000000",
      },
    ],
  },
};

export const SendMessage: Story = {
  args: {
    walletMeta: {
      userEntryAddress: MOCK_WALLET_DATA.userEntryAddress,
    },
    targetChainId: CosmosSdkChainId.Sei,
    messages: [sendMessage],
    rawData: [sendMessage],
    onReject: () => {},
    onApprove: async () => {},
  },
};

const executeMessage = {
  type: "wasm/MsgExecuteContract",
  value: {
    sender: "sei1rptyr50v9sdythznd46vvml5wpp3uzvhdyfwqf",
    contract: "sei1zp6ucuft3fptzfysd06cd37we7setrt364ea753dkwepr4ulfwwqdeqvyw",
    msg: {
      swap: {
        offer_asset: {
          info: {
            native_token: {
              denom: "usei",
            },
          },
          amount: "1000000",
        },
        max_spread: "0.005",
        belief_price: "0.268860641194988760",
      },
    },
    funds: [
      {
        amount: "1000000",
        denom: "usei",
      },
    ],
  },
};
const targetChain = TargetChain.chainId(CosmosSdkChainId.Sei);
const encodeObject = targetChain.aminoTypes.fromAmino(executeMessage);

export const AstroportSwapMessage: Story = {
  args: {
    walletMeta: {
      userEntryAddress: MOCK_WALLET_DATA.userEntryAddress,
    },
    targetChainId: CosmosSdkChainId.Sei,
    messages: [encodeObject],
    rawData: [executeMessage],
    onReject: () => {},
    onApprove: async () => {},
  },
};
