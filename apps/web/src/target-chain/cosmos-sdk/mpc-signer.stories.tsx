import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { fetchPublicKey } from "@/hooks/use-public-key";
import {
  AutomatedTest,
  automatedTestPlay,
  providerWithWalletDecorator,
} from "@/storybook-helpers";
import { TargetChainId } from "@/target-chain";
import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { StdSignature } from "@cosmjs/amino";
import { sha256 } from "@cosmjs/crypto";
import { fromBase64 } from "@cosmjs/encoding";
import { useQuery } from "@obi-wallet/headless-ui";
import { MpcWallet } from "@obi-wallet/sdk";
import { Meta, StoryObj } from "@storybook/react";
import * as secp256k1 from "secp256k1";
import invariant from "tiny-invariant";

const meta = {
  title: "Tests/target-chain/cosmos-sdk/mpc-signer",
  component: AutomatedTest,
} satisfies Meta<typeof AutomatedTest>;

export default meta;
type Story = StoryObj<typeof meta>;

class TestCosmosSdkMpcSigner extends CosmosSdkMpcSigner {
  public static override async fromWallet(
    wallet: MpcWallet,
    targetChainId: TargetChainId,
  ): Promise<TestCosmosSdkMpcSigner> {
    const publicKey = await fetchPublicKey(wallet);

    return new TestCosmosSdkMpcSigner(wallet, publicKey, targetChainId);
  }

  public override async signHashWithEasyShare(
    address: string,
    hash: Uint8Array,
  ): Promise<StdSignature> {
    return await super.signHashWithEasyShare(address, hash);
  }
}

export const SignHashWithEasyShare: Story = {
  name: "signHashWithEasyShare",
  decorators: [providerWithWalletDecorator],
  render: function SignHashWithEasyShareTest() {
    const wallet = useCurrentWallet({});
    const query = useQuery({
      queryKey: ["signHashWithEasyShare", wallet?.userEntryAddress],
      queryFn: async () => {
        invariant(wallet, "Expected wallet to be set.");

        const signer = await TestCosmosSdkMpcSigner.fromWallet(
          wallet,
          CosmosSdkChainId.Sei,
        );
        const account = (await signer.getAccounts())[0];

        invariant(account, "Expected account to be set");

        const message = "hello world";
        const hash = sha256(Buffer.from(message, "utf-8"));
        const signature = await signer.signHashWithEasyShare(
          account.address,
          hash,
        );

        return secp256k1.ecdsaVerify(
          fromBase64(signature.signature),
          hash,
          fromBase64(signature.pub_key.value),
        );
      },
      enabled: !!wallet,
    });

    return (
      <AutomatedTest
        done={query.isSuccess || query.isError}
        success={query.data}
      />
    );
  },
  play: automatedTestPlay,
};
