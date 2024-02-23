import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { providerWithWalletDecorator } from "@/storybook-helpers";
import { dashboardLayoutDecorator } from "@/storybook-helpers/layouts";
import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { fromHex } from "@cosmjs/encoding";
import { makeSignDoc } from "@cosmjs/proto-signing";
import type { Meta, StoryObj } from "@storybook/react";

import { ApproveMessagesSignDoc } from "./approve-messages-sign-doc";

const meta = {
  title: "User Interactions/Approve Messages Sign Doc",
  component: ApproveMessagesSignDoc,
  tags: ["autodocs"],
  decorators: [dashboardLayoutDecorator, providerWithWalletDecorator],
} satisfies Meta<typeof ApproveMessagesSignDoc>;

export default meta;
type Story = StoryObj<typeof meta>;

// Workaround so that Storybook doesn't fail when BigInt is used
// See https://github.com/storybookjs/storybook/issues/22452
// @ts-expect-error intentionally overwriting BigInt
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const TestTx: Story = {
  args: {
    walletMeta: {
      userEntryAddress: MOCK_WALLET_DATA.userEntryAddress,
    },
    signerAddress: "sei1rptyr50v9sdythznd46vvml5wpp3uzvhdyfwqf",
    signDoc: makeSignDoc(
      fromHex(
        "0a90010a1c2f636f736d6f732e62616e6b2e763162657461312e4d736753656e6412700a2d636f736d6f7331706b707472653766646b6c366766727a6c65736a6a766878686c63337234676d6d6b38727336122d636f736d6f7331717970717870713971637273737a673270767871367273307a716733797963356c7a763778751a100a0575636f736d120731323334353637",
      ),
      fromHex(
        "0a4e0a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a21034f04181eeba35391b858633a765c4a0c189697b40d216354d50890d350c7029012040a02080112130a0d0a0575636f736d12043230303010c09a0c",
      ),
      CosmosSdkChainId.Sei,
      1,
    ),
    onReject: () => {},
    onApprove: async () => {},
  },
};
