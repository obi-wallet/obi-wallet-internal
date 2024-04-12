import { useStore } from "@/contexts";
import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { fetchOwner, useOwnerQuery } from "@/hooks/use-owner";
import { usePublicKeyQuery } from "@/hooks/use-public-key";
import { staleTime } from "@/lib/stale-time";
import { useQuery } from "@obi-wallet/headless-ui";
import { KeyType } from "@obi-wallet/sdk";
import {
  useMutation,
  UseMutationResult,
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
            backups: await homeChain.lookupWalletBackup(key.publicKey),
          };
        }),
      );
    },
    enabled: !!wallet,
  });
}

export function useBackupWalletAutomatically() {
  const wallet = useCurrentWallet({});
  const backupWalletMutation = useBackupWalletMutation();
  const owner = useOwnerQuery();

  useQuery({
    queryKey: ["wallet-backup-mutation", wallet?.userEntryAddress],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      invariant(owner.data, "Expected owner to be set.");
      if (wallet.owner.address === owner.data) {
        backupWalletMutation.mutate();
      }
      return true;
    },
    gcTime: staleTime({ days: 1 }),
    staleTime: staleTime({ days: 1 }),
    enabled: !!wallet && !!owner.data,
  });
}

export function useBackupWalletMutation() {
  const wallet = useCurrentWallet({});
  const { userDataStore, keyMetaDataStore } = useStore();

  return useMutation({
    mutationFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      const homeChain = HomeChain.chainId(wallet.homeChainId);
      const userData = userDataStore.getUserData(wallet.userEntryAddress);
      return await homeChain.backupWallet({
        wallet: wallet.toJSON(),
        userData: {
          name: userData?.name ?? "",
          avatar: userData?.avatar ?? "",
        },
        keyMetaData: keyMetaDataStore.getKeyMetaData(wallet.userEntryAddress),
      });
    },
  });
}

export function useWalletBackupCheck(): WalletHealthCheck {
  const wallet = useCurrentWallet({});

  const walletBackup = useWalletBackupQuery();
  const resolve = useBackupWalletMutation();

  const query = useQuery({
    queryKey: ["wallet-backup-check", wallet?.userEntryAddress],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      invariant(walletBackup.data, "Expected wallet backup to be set.");
      const backupPerKey = walletBackup.data;

      return backupPerKey.every((backup) => {
        const fail = (message: string) => {
          console.error(message);
          return false;
        };

        if (
          backup.key.type === KeyType.Passkey &&
          backup.backups.length !== 1
        ) {
          return fail(
            `Expected exactly one backup per key, got ${backupPerKey.length}`,
          );
        }

        if (backup.backups.length === 0) {
          return fail(`Expected a backup per key, got ${backupPerKey.length}`);
        }

        const [data] = backup.backups;
        invariant(data, "Expected data to be set");

        if (data.proxyAddress.address !== wallet.userEntryAddress) {
          return fail(
            `Expected backup to be for wallet ${wallet.userEntryAddress}, got ${data.proxyAddress.address}`,
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

        if (typeof data.encryptedBackupShare !== "string") {
          return fail("Expected backup share to be backed up");
        }

        return true;
      });
    },
    enabled: !!wallet && !!walletBackup.data,
  });

  return {
    label: "Wallet backup is available",
    resolve,
    query,
  };
}

export function useWalletBackupIncludesEasyShareCheck(): WalletHealthCheck {
  const wallet = useCurrentWallet({});

  const walletBackup = useWalletBackupQuery();
  const resolve = useBackupWalletMutation();

  const query = useQuery({
    queryKey: [
      "wallet-backup-includes-easy-share-check",
      wallet?.userEntryAddress,
    ],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      invariant(walletBackup.data, "Expected wallet backup to be set.");
      const backupPerKey = walletBackup.data;

      return backupPerKey.every((backup) => {
        const fail = (message: string) => {
          console.error(message);
          return false;
        };

        if (
          backup.key.type === KeyType.Passkey &&
          backup.backups.length !== 1
        ) {
          return fail(
            `Expected exactly one backup per key, got ${backupPerKey.length}`,
          );
        }

        if (backup.backups.length === 0) {
          return fail(`Expected a backup per key, got ${backupPerKey.length}`);
        }

        const [data] = backup.backups;
        invariant(data, "Expected data to be set");

        if (typeof data.encryptedEasyShare !== "string") {
          return fail("Expected easy share to be backed up");
        }

        return true;
      });
    },
    enabled: !!wallet && !!walletBackup.data,
  });

  return {
    label: "Wallet backup includes easy share",
    resolve: wallet?.encryptedEasyShare ? resolve : undefined,
    query,
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
