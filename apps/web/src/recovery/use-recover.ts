import { useStore } from "@/contexts";
import {
  SharesBackupEncryption,
  SharesLocalEncryption,
} from "@/lib/encryption";
import {
  MultisigKey,
  ObservableMpcWallet,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk";
import { z } from "zod";

export const ProxyWallet = z.object({
  proxyAddress: z.object({
    address: z.string(),
  }),
  owner: z.object({
    threshold: z.string(),
    keys: z.array(
      z.object({
        type: z.string(),
        publicKey: Secp256k1PublicKey,
      }),
    ),
  }),
  userData: z.object({
    name: z.string(),
    avatar: z.string(),
  }),
  encryptedBackupShare: z.string(),
  encryptedEasyShare: z.string().optional(),
});

export type ProxyWallet = z.TypeOf<typeof ProxyWallet>;

export function useRecover() {
  const { mpcWalletsStore, userDataStore } = useStore();

  async function recover({
    account,
    multisigKey,
  }: {
    multisigKey: MultisigKey;
    account: ProxyWallet;
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
          if (!ownerKey) return false;
          return key.publicKey.value === ownerKey.publicKey.value;
        });

        if (!publicKeysMatch) {
          throw new Error("Multisig key public keys do not match");
        }

        const owner = multisigKey.toJSON();
        if (!owner) {
          throw new Error("Owner missing");
        }

        const primaryKey = multisigKey.primaryKey;
        if (!primaryKey) {
          throw new Error("Primary Key missing");
        }

        const sharesBackupEncryption = new SharesBackupEncryption(multisigKey);
        const decryptedShares = await sharesBackupEncryption.decrypt({
          easy: account.encryptedEasyShare,
          backup: account.encryptedBackupShare,
        });

        const sharesLocalEncryption = new SharesLocalEncryption(multisigKey);
        const encryptedShares = await sharesLocalEncryption.encrypt({
          easy: decryptedShares.easy,
          backup: decryptedShares.backup,
        });

        userDataStore.setUserData(
          account.proxyAddress.address,
          account.userData,
        );

        const wallet = ObservableMpcWallet.create({
          homeChain: multisigKey.chainId,
          owner,
          userEntryAddress: account.proxyAddress.address,
          encryptedShares,
        });
        mpcWalletsStore.upsertWallet(wallet);
      }
    } catch (e) {
      const error = e as Error;
      window.alert(error.message);
    }
  }

  return recover;
}
