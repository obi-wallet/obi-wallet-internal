import {
  AutomatedTest,
  automatedTestPlay,
  providerWithWalletDecorator,
} from "@/storybook-helpers";
import { Meta, StoryObj } from "@storybook/react";
import { useQuery } from "@obi-wallet/headless-ui";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { StdSignature } from "@cosmjs/amino";
import invariant from "tiny-invariant";
import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { BackupShare, MpcWallet } from "@obi-wallet/sdk";
import { TargetChainId } from "@/target-chain";
import { newFetchPublicKey } from "@/hooks/use-public-key";
import { sha256 } from "@cosmjs/crypto";
import { useStore } from "@/contexts";
import { MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE } from "@/mocks/mpc";

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
    const publicKey = await newFetchPublicKey(wallet);

    return new TestCosmosSdkMpcSigner(wallet, publicKey, targetChainId);
  }

  public override async signHashWithEasyShare(
    address: string,
    hash: Uint8Array,
  ): Promise<StdSignature> {
    return await super.signHashWithEasyShare(address, hash);
  }

  public override async signHashWithBackupShare(
    address: string,
    hash: Uint8Array,
  ): Promise<StdSignature> {
    return await super.signHashWithBackupShare(address, hash);
  }

  public override async signHashWithEasyAndBackupShare(
    address: string,
    hash: Uint8Array,
  ): Promise<StdSignature> {
    return await super.signHashWithEasyAndBackupShare(address, hash);
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

        const hash = sha256(new Uint8Array(32));
        const signature = await signer.signHashWithEasyShare(
          account.address,
          hash,
        );
        return !!signature;
      },
      enabled: !!wallet,
    });

    return <AutomatedTest done={!query.isLoading} success={query.isSuccess} />;
  },
  play: automatedTestPlay,
};

export const SignHashWithBackupShare: Story = {
  name: "signHashWithBackupShare",
  decorators: [providerWithWalletDecorator],
  render: function SignHashWithBackupShareTest() {
    const wallet = useCurrentWallet({});
    const query = useQuery({
      queryKey: ["signHashWithBackupShare", wallet?.userEntryAddress],
      queryFn: async () => {
        invariant(wallet, "Expected wallet to be set.");

        const signer = await TestCosmosSdkMpcSigner.fromWallet(
          wallet,
          CosmosSdkChainId.Sei,
        );
        const account = (await signer.getAccounts())[0];

        invariant(account, "Expected account to be set");

        const hash = sha256(new Uint8Array(32));
        const signature = await signer.signHashWithBackupShare(
          account.address,
          hash,
        );
        console.log(signature);
        return !!signature;
      },
      enabled: !!wallet,
    });

    return <AutomatedTest done={!query.isLoading} success={query.isSuccess} />;
  },
  play: automatedTestPlay,
};

export const SignHashWithEasyAndBackupShare: Story = {
  name: "signHashWithEasyAndBackupShare",
  decorators: [providerWithWalletDecorator],
  render: function SignHashWithEasyAndBackupShareTest() {
    const wallet = useCurrentWallet({});
    const query = useQuery({
      queryKey: ["signHashWithEasyAndBackupShare", wallet?.userEntryAddress],
      queryFn: async () => {
        invariant(wallet, "Expected wallet to be set.");

        const signer = await TestCosmosSdkMpcSigner.fromWallet(
          wallet,
          CosmosSdkChainId.Sei,
        );
        const account = (await signer.getAccounts())[0];

        invariant(account, "Expected account to be set");

        const hash = sha256(new Uint8Array(32));
        const signature = await signer.signHashWithEasyAndBackupShare(
          account.address,
          hash,
        );
        console.log(signature);
        return !!signature;
      },
      enabled: !!wallet,
    });

    return <AutomatedTest done={!query.isLoading} success={query.isSuccess} />;
  },
  play: automatedTestPlay,
};

export const MpcFoo: Story = {
  name: "mpcFoo",
  decorators: [providerWithWalletDecorator],
  render: function SignHashWithBackupShareTest() {
    const wallet = useCurrentWallet({});
    const { mpcStore, wasmStore } = useStore();
    const query = useQuery({
      queryKey: ["distributeShares", wallet?.userEntryAddress],
      queryFn: async () => {
        const mpcPackage = await wasmStore.getMpcEcdsaWasm();

        // const shares = await mpcStore.getShares();
        const shares = MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE;
        try {
          const signers = mpcPackage.createSigners([
            shares.easyShare.preSignForBackupShare,
            BackupShare.parse(shares.backupShare),
          ]);
          console.log(signers.length);
          console.log("that works!");
        } catch (e) {
          console.error("DOES NOT WORK");
          console.error(e);
        }
        // invariant(wallet, "Expected wallet to be set.");
        //
        // const signer = await TestCosmosSdkMpcSigner.fromWallet(
        //     wallet,
        //     CosmosSdkChainId.Sei,
        // );
        // const account = (await signer.getAccounts())[0];
        //
        // invariant(account, "Expected account to be set");
        //
        // const hash = sha256(new Uint8Array(32));
        // const signature = await signer.signHashWithBackupShare(
        //     account.address,
        //     hash,
        // );
        // console.log(signature);
        // return !!signature;
      },
      enabled: !!wallet,
    });

    return <AutomatedTest done={!query.isLoading} success={query.isSuccess} />;
  },
  play: automatedTestPlay,
};
