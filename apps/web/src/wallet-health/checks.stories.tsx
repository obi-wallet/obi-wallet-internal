import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import {
  SharesBackupEncryption,
  SharesLocalEncryption,
} from "@/lib/encryption";
import {
  AutomatedTest,
  automatedTestPlay,
  providerWithWalletDecorator,
} from "@/storybook-helpers";
import {
  useOwnerUpToDateCheck,
  usePublicKeyKnownCheck,
  useWalletBackupCheck,
  useWalletBackupIncludesEasyShareCheck,
} from "@/wallet-health/checks";
import { useQuery } from "@obi-wallet/headless-ui";
import { Meta, StoryObj } from "@storybook/react";
import { equals } from "ramda";
import invariant from "tiny-invariant";

const meta = {
  title: "Tests/wallet-health/checks",
  component: AutomatedTest,
} satisfies Meta<typeof AutomatedTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UsePublicKeyKnownCheck: Story = {
  name: "usePublicKeyKnownCheck",
  decorators: [providerWithWalletDecorator],
  render: function UsePublicKeyKnownCheckTest() {
    const check = usePublicKeyKnownCheck();
    return (
      <AutomatedTest
        done={check.query.isSuccess || check.query.isError}
        success={check.query.isSuccess && !!check.query.data}
      />
    );
  },
  play: automatedTestPlay,
};

export const UseOwnerUpToDateCheck: Story = {
  name: "useOwnerUpToDateCheck",
  decorators: [providerWithWalletDecorator],
  render: function UseOwnerUpToDateCheckTest() {
    const check = useOwnerUpToDateCheck();
    return (
      <AutomatedTest
        done={check.query.isSuccess || check.query.isError}
        success={check.query.isSuccess && !!check.query.data}
      />
    );
  },
  play: automatedTestPlay,
};

export const UseWalletBackupCheck: Story = {
  name: "useWalletBackupCheck",
  decorators: [providerWithWalletDecorator],
  render: function UseWalletBackupCheckTest() {
    const check = useWalletBackupCheck();

    return (
      <AutomatedTest
        done={check.query.isSuccess || check.query.isError}
        success={check.query.isSuccess && !!check.query.data}
      />
    );
  },
  play: automatedTestPlay,
};

export const UseWalletBackupIncludesEasyShareCheck: Story = {
  name: "useWalletBackupIncludesEasyShareCheck",
  decorators: [providerWithWalletDecorator],
  render: function UseWalletBackupCheckTest() {
    const check = useWalletBackupIncludesEasyShareCheck();

    return (
      <AutomatedTest
        done={check.query.isSuccess || check.query.isError}
        success={check.query.isSuccess && !!check.query.data}
      />
    );
  },
  play: automatedTestPlay,
};

export const EncryptedBackups: Story = {
  decorators: [providerWithWalletDecorator],
  render: function EncryptedBackupsTest() {
    const wallet = useCurrentWallet({});
    const query = useQuery({
      queryKey: ["encrypted-backups", wallet?.userEntryAddress],
      queryFn: async () => {
        invariant(wallet, "Expected wallet to be set.");

        const primaryKey = wallet.owner.primaryKey;
        invariant(primaryKey, "Expected passkey to be set");

        const [data] = await HomeChain.chainId(
          wallet.homeChainId,
        ).lookupWalletBackup(primaryKey.publicKey);
        invariant(data, "Expected data to be set");

        const sharesLocalEncryption = new SharesLocalEncryption(wallet.owner);
        const sharesBackupEncryption = new SharesBackupEncryption(wallet.owner);

        const [actualShares, backedUpShares] = await Promise.all([
          sharesLocalEncryption.decrypt({
            easy: wallet.encryptedEasyShare,
            backup: wallet.encryptedBackupShare,
          }),
          sharesBackupEncryption.decrypt({
            easy: data.encryptedEasyShare,
            backup: data.encryptedBackupShare,
          }),
        ]);

        return equals(actualShares, backedUpShares);
      },
      enabled: !!wallet,
    });

    return (
      <AutomatedTest
        done={query.isSuccess || query.isError}
        success={query.isSuccess && query.data}
      />
    );
  },
};
