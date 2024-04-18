import { useStore } from "@/contexts";
import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { fetchOwner, useOwnerQuery } from "@/hooks/use-owner";
import { usePublicKeyQuery } from "@/hooks/use-public-key";
import { SetWalletDataUserInteraction } from "@/user-interactions/set-wallet-data-user-interaction";
import { useQuery } from "@obi-wallet/headless-ui";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import invariant from "tiny-invariant";

export interface WalletHealthCheck {
  label: string;
  /** Query should return a truthy value if the check passes. */
  query: UseQueryResult;
  /** An optional mutation that fixes the problem */
  resolve?: UseMutationResult<void, Error, void, unknown>;
}

export function usePublicKeyKnownCheck(): WalletHealthCheck {
  const query = usePublicKeyQuery();

  return {
    label: "Secret signer has public key for this wallet",
    query,
  };
}

export function useOwnerUpToDateCheck(): WalletHealthCheck {
  const wallet = useCurrentWallet({});
  const query = useQuery({
    queryKey: ["owner-up-to-date", wallet?.userEntryAddress],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      const owner = await fetchOwner(wallet);
      return wallet.owner.address === owner;
    },
    enabled: !!wallet,
  });

  return {
    label: "Owner is up to date",
    query,
  };
}

function useWalletBackupQuery() {
  const wallet = useCurrentWallet({});
  return useQuery({
    queryKey: ["wallet-backup", wallet?.userEntryAddress],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      const homeChain = HomeChain.chainId(wallet.homeChainId);
      return await Promise.all(
        wallet.owner.keys.map(async (key) => {
          return {
            key,
            data: await homeChain.lookupWalletBackup({
              homeChainId: wallet.homeChainId,
              publicKey: key.publicKey,
            }),
          };
        }),
      );
    },
    enabled: !!wallet,
  });
}

export function useWalletBackupMutation() {
  const wallet = useCurrentWallet({});
  const { keyMetaDataStore } = useStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      const keyMetaData = keyMetaDataStore.getKeyMetaData(
        wallet.userEntryAddress,
      );
      await SetWalletDataUserInteraction.start({
        homeChainId: wallet.homeChainId,
        owner: wallet.owner.toJSON()!,
        keyMetaData: keyMetaData,
        serializedWalletData: JSON.stringify(
          await HomeChain.chainId(wallet.homeChainId).getWalletData({
            wallet: wallet.toJSON(),
            keyMetaData: keyMetaData,
          }),
        ),
      });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["wallet-backup", wallet.userEntryAddress],
        }),
        queryClient.invalidateQueries({
          queryKey: ["wallet-backup-check", wallet.userEntryAddress],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "wallet-backup-includes-easy-share-check",
            wallet.userEntryAddress,
          ],
        }),
      ]);
    },
  });
}

export function useBackupWalletAutomatically() {
  const wallet = useCurrentWallet({});
  const owner = useOwnerQuery();

  useQuery({
    queryKey: ["wallet-backup-mutation", wallet?.userEntryAddress],
    queryFn: async () => {
      // TODO: review!
      return true;

      // invariant(wallet, "Expected wallet to be set.");
      // invariant(owner.data, "Expected owner to be set.");
      // if (wallet.owner.address === owner.data) {
      //   backupWalletMutation.mutate();
      //   return true;
      // }
      //
      // console.log("owners do not match, sync!");
      //
      // if (wallet.owner.primaryKey?.publicKey) {
      //   // First, check whether primary key is still okay
      //   const homeChain = HomeChain.chainId(wallet.homeChainId);
      //   const [proxyWallet] = await homeChain.lookupWalletBackup(
      //     wallet.owner.primaryKey?.publicKey,
      //   );
      //
      //   if (
      //     proxyWallet &&
      //     proxyWallet.proxyAddress.address === wallet.userEntryAddress
      //   ) {
      //     const backupOwner = ObservableMultisigKey.create(wallet.homeChainId);
      //     proxyWallet.owner.keys.forEach((key) => {
      //       switch (key.type) {
      //         case KeyType.Passkey:
      //           backupOwner.addPendingRecoveryKey({
      //             type: KeyType.Passkey,
      //             publicKey: key.publicKey,
      //           });
      //           break;
      //         case KeyType.Phone:
      //           backupOwner.addPhoneKey(key.publicKey);
      //           break;
      //         case KeyType.Telegram:
      //           backupOwner.addTelegramKey(key.publicKey);
      //           break;
      //       }
      //     });
      //     backupOwner.removeKeyByPublicKey(wallet.owner.primaryKey.publicKey);
      //     const key = backupOwner.addPasskeyKey(
      //       wallet.owner.primaryKey.payload,
      //     );
      //     backupOwner.setPrimaryKey(key);
      //
      //     if (backupOwner.address === owner.data) {
      //       console.log("We were able to recover the new owner");
      //       // TODO: trigger interaction to sync with backup
      //     }
      //   }
      // }
      //
      // return true;
    },
    // gcTime: staleTime({ days: 1 }),
    // staleTime: staleTime({ days: 1 }),
    enabled: !!wallet && !!owner.data,
  });
}

export function useWalletBackupCheck(): WalletHealthCheck {
  const wallet = useCurrentWallet({});

  const walletBackup = useWalletBackupQuery();
  const resolve = useWalletBackupMutation();

  const query = useQuery({
    queryKey: ["wallet-backup-check", wallet?.userEntryAddress],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      invariant(walletBackup.data, "Expected wallet backup to be set.");
      const backupPerKey = walletBackup.data;

      return backupPerKey.every(({ data }) => {
        const fail = (message: string) => {
          console.error(message);
          return false;
        };

        invariant(data, "Expected data to be set");

        if (data.userEntryAddress !== wallet.userEntryAddress) {
          return fail(
            `Expected backup to be for wallet ${wallet.userEntryAddress}, got ${data.userEntryAddress}`,
          );
        }

        const actualOwner = wallet.owner;
        const backupOwner = data.owner;

        if (backupOwner.threshold !== actualOwner.threshold.toString()) {
          return fail(
            `Expected backup threshold to be ${actualOwner.threshold.toString()}, got ${backupOwner.threshold}`,
          );
        }

        if (backupOwner.keys.length !== actualOwner.keys.length) {
          return fail(
            `Expected backup to have ${actualOwner.keys.length} keys, got ${backupOwner.keys.length}`,
          );
        }

        const allKeysMatch = backupOwner.keys.every((backupKey, i) => {
          const actualKey = actualOwner.keys[i];
          invariant(actualKey, "Expected actual key to be set");

          if (backupKey.type !== actualKey.type) return false;
          if (
            JSON.stringify(backupKey.publicKey) !==
            JSON.stringify(actualKey.publicKey)
          ) {
            return false;
          }

          return true;
        });

        if (!allKeysMatch) {
          return fail("Expected all keys to match");
        }

        if (typeof data.encryptedShares.backup !== "string") {
          return fail("Expected backup share to be backed up");
        }

        return true;
      });
    },
    enabled: !!wallet && !!walletBackup.data,
  });

  return {
    label: "Wallet backup is available",
    query,
    resolve,
  };
}

export function useWalletBackupIncludesEasyShareCheck(): WalletHealthCheck {
  const wallet = useCurrentWallet({});

  const walletBackup = useWalletBackupQuery();
  const resolve = useWalletBackupMutation();

  const query = useQuery({
    queryKey: [
      "wallet-backup-includes-easy-share-check",
      wallet?.userEntryAddress,
    ],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      invariant(walletBackup.data, "Expected wallet backup to be set.");
      const backupPerKey = walletBackup.data;

      return backupPerKey.every(({ data }) => {
        const fail = (message: string) => {
          console.error(message);
          return false;
        };

        invariant(data, "Expected data to be set");

        if (typeof data.encryptedShares.easy !== "string") {
          return fail("Expected easy share to be backed up");
        }

        return true;
      });
    },
    enabled: !!wallet && !!walletBackup.data,
  });

  return {
    label: "Wallet backup includes easy share",
    query,
    resolve,
  };
}

export function useWalletHasEasyShareCheck(): WalletHealthCheck {
  const wallet = useCurrentWallet({});

  const query = useQuery({
    queryKey: ["wallet-has-easy-share", wallet?.userEntryAddress],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      return !!wallet.encryptedEasyShare;
    },
    enabled: !!wallet,
  });

  return {
    label: "Wallet has easy share",
    query,
  };
}
