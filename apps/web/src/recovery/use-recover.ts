import { useStore } from "@/contexts";
import {
  MultisigKey,
  KeyMetaData,
  RecoverWalletUserInteraction,
  WalletData,
} from "@obi-wallet/sdk";
import { useRouter } from "next/navigation";

export const ProxyWallet = WalletData;

export type ProxyWallet = WalletData;

export function useRecover() {
  const router = useRouter();
  const { mpcWalletsStore } = useStore();

  async function recover({
    account,
    multisigKey,
    keyMetaData,
  }: {
    multisigKey: MultisigKey;
    account: ProxyWallet;
    keyMetaData: KeyMetaData;
  }) {
    try {
      const wallet = mpcWalletsStore.getWalletByUserEntryAddress(
        account.proxyAddress.address,
      );
      if (wallet) {
        mpcWalletsStore.setCurrentWallet(wallet);
      } else {
        if (multisigKey.threshold.toString() !== account.owner.threshold) {
          throw new Error("Multisig key threshold does not match");
        }

        if (multisigKey.keys.length !== account.owner.keys.length) {
          throw new Error("Multisig key public keys do not match");
        }

        const publicKeysMatch = multisigKey.keys.every((key, i) => {
          const ownerKey = account.owner.keys[i];
          if (!ownerKey) {
            return false;
          }
          return key.publicKey.value === ownerKey.publicKey.value;
        });

        if (!publicKeysMatch) {
          throw new Error("Multisig key public keys do not match");
        }

        const owner = multisigKey.toJSON();
        if (!owner) {
          throw new Error("Owner missing");
        }

        // const primaryKey = multisigKey.primaryKey;
        // if (!primaryKey) {
        //   throw new Error("Primary Key missing");
        // }

        await RecoverWalletUserInteraction.start({
          homeChainId: multisigKey.chainId,
          owner: multisigKey.toJSON()!,
          walletData: account,
          keyMetaData,
        });
        router.replace("/dashboard/settings/security");
      }
    } catch (e) {
      const error = e as Error;
      window.alert(error.message);
    }
  }

  return recover;
}
