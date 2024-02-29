import { useStore } from "@/contexts";
import {
  MultisigKeyDecryption,
  MultisigKeyEncryption,
  Secp256k1Encryption,
} from "@/lib/encryption";
import {
  KeyType,
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
  const { mpcWalletsStore } = useStore();

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

        const passKey = multisigKey.getUsableKeyOfType(KeyType.Passkey);
        if (!passKey) {
          throw new Error("Passkey missing");
        }

        const multisigKeyDecryption = new MultisigKeyDecryption([
          passKey.payload.privateKey,
        ]);
        const easyShare = account.encryptedEasyShare
          ? await multisigKeyDecryption.decrypt(account.encryptedEasyShare)
          : undefined;
        const backupShare = await multisigKeyDecryption.decrypt(
          account.encryptedBackupShare,
        );

        const passkeyEncryption = new Secp256k1Encryption(passKey.publicKey);
        const multisigKeyEncryption = new MultisigKeyEncryption(
          multisigKey.publicKey,
        );

        const encryptedEasyShare = easyShare
          ? await passkeyEncryption.encrypt(easyShare)
          : undefined;
        const encryptedBackupShare =
          await multisigKeyEncryption.encrypt(backupShare);

        const wallet = ObservableMpcWallet.create({
          homeChain: multisigKey.chainId,
          owner,
          userEntryAddress: account.proxyAddress.address,
          encryptedShares: {
            easy: encryptedEasyShare,
            backup: encryptedBackupShare,
          },
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
