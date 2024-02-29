import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { MultisigKeyDecryption, Secp256k1Decryption } from "@/lib/encryption";
import {
  AutomatedTest,
  automatedTestPlay,
  providerWithWalletDecorator,
} from "@/storybook-helpers";
import {
  usePublicKeyKnownCheck,
  useWalletBackupCheck,
} from "@/wallet-health/checks";
import { useQuery } from "@obi-wallet/headless-ui";
import { KeyType } from "@obi-wallet/sdk";
import { Meta, StoryObj } from "@storybook/react";
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

export const EncryptedBackups: Story = {
  decorators: [providerWithWalletDecorator],
  render: function EncryptedBackupsTest() {
    const wallet = useCurrentWallet({});
    const query = useQuery({
      queryKey: ["encrypted-backups", wallet?.userEntryAddress],
      queryFn: async () => {
        invariant(wallet, "Expected wallet to be set.");
        const passkey = wallet.owner.getUsableKeyOfType(KeyType.Passkey);
        invariant(passkey, "Expected passkey to be set");
        const [data] = await HomeChain.chainId(
          wallet.homeChainId,
        ).lookupWalletBackup(passkey.publicKey);

        invariant(data, "Expected data to be set");
        invariant(passkey, "No usable passkey found");

        const passkeyDecryption = new Secp256k1Decryption(
          passkey.payload.privateKey,
        );
        const multisigKeyDecryption = new MultisigKeyDecryption([
          passkey.payload.privateKey,
        ]);

        const [
          actualEasyShare,
          actualBackupShare,
          backedUpEasyShare,
          backedUpBackupShare,
        ] = await Promise.all([
          wallet.encryptedEasyShare
            ? passkeyDecryption.decrypt(wallet.encryptedEasyShare)
            : undefined,
          multisigKeyDecryption.decrypt(wallet.encryptedBackupShare),
          multisigKeyDecryption.decrypt(data.encryptedEasyShare ?? ""),
          multisigKeyDecryption.decrypt(data.encryptedBackupShare),
        ]);

        return (
          actualEasyShare === backedUpEasyShare &&
          actualBackupShare === backedUpBackupShare
        );
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
