import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { fetchPublicKey } from "@/hooks/use-public-key";
import {
  AutomatedTest,
  automatedTestPlay,
  providerWithWalletDecorator,
} from "@/storybook-helpers";
import { TargetChainId } from "@/target-chain";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { StdSignature } from "@cosmjs/amino";
import { useQuery } from "@obi-wallet/headless-ui";
import { MpcWallet, SecretJsHomeChainId } from "@obi-wallet/sdk";
import { Meta, StoryObj } from "@storybook/react";
import { NewOnboardingPayload } from "@/onboarding/new-onboarding-payload";
import { MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE } from "@/mocks/mpc";
import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import invariant from "tiny-invariant";

const meta = {
  title: "OnboardingPayload",
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
        invariant(wallet, "Wallet not found");
        const onboardingPayload = new NewOnboardingPayload(
          SecretJsHomeChainId.MAINNET,
        );
        onboardingPayload._shares = MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE;
        onboardingPayload._distributedShares = true;
        onboardingPayload._unclaimedHomeAccount = {
          homeAccountAddress: wallet.userEntryAddress,
          ownerAddress: wallet.owner.address,
          ownerIndex: 0,
        };
        onboardingPayload._multisigKey = wallet.owner.clone();
        onboardingPayload.confirmOwner();
        await onboardingPayload.continueFlow();
        return true;
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
