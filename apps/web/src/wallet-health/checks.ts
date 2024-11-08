import { useStore } from "@/contexts";
import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { fetchOwner } from "@/hooks/use-owner";
import {
  useEd25519PublicKeyQuery,
  useSecp256k1PublicKeyQuery,
} from "@/hooks/use-public-key";
import { SetWalletDataUserInteraction } from "@/user-interactions/set-wallet-data-user-interaction";
import {
  useWalletDataStateQuery,
  WalletDataStateType,
} from "@/wallet-data-backup/sync-wallet-data";
import { useQuery } from "@obi-wallet/headless-ui";
import { serialize } from "@obi-wallet/sdk-json";
import {
  skipToken,
  useMutation,
  UseMutationResult,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import invariant from "tiny-invariant";

export interface WalletHealthCheck {
  label: string;
  /** Query should return a truthy value if the check passes. */
  query: UseQueryResult;
  /** An optional mutation that fixes the problem */
  resolve?: UseMutationResult<void, Error, void, unknown>;
}

export function useSecp256k1PublicKeyKnownCheck(): WalletHealthCheck {
  const query = useSecp256k1PublicKeyQuery();

  return {
    label: "Secret signer has Secp256k1 public key for this wallet",
    query,
  };
}

export function useEd25519PublicKeyKnownCheck(): WalletHealthCheck {
  const query = useEd25519PublicKeyQuery();

  return {
    label: "Secret signer has Ed25519 public key for this wallet",
    query,
  };
}

export function useOwnerUpToDateCheck(): WalletHealthCheck {
  const wallet = useCurrentWallet();
  const query = useQuery({
    queryKey: ["owner-up-to-date", wallet?.userEntryAddress],
    queryFn: wallet
      ? async () => {
          const owner = await fetchOwner(wallet);
          return wallet.owner.address === owner;
        }
      : skipToken,
  });

  return {
    label: "Owner is up to date",
    query,
  };
}

function useWalletBackupQuery() {
  const wallet = useCurrentWallet();
  return useQuery({
    queryKey: ["wallet-backup", wallet?.userEntryAddress],
    queryFn: wallet
      ? async () => {
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
        }
      : skipToken,
  });
}

export function useWalletBackupMutation() {
  const wallet = useCurrentWallet();
  const { keyMetaDataStore } = useStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      const keyMetaData = keyMetaDataStore.getKeyMetaData(
        wallet.userEntryAddress,
      );
      const walletData = await HomeChain.chainId(
        wallet.homeChainId,
      ).getWalletData({
        wallet: wallet.toJSON(),
        keyMetaData: keyMetaData,
      });
      walletData.revision++;
      const response = await SetWalletDataUserInteraction.start({
        homeChainId: wallet.homeChainId,
        owner: wallet.owner.toJSON(),
        keyMetaData: keyMetaData,
        serializedWalletData: serialize(walletData),
      });
      if (response.approved) {
        wallet.setPreviousWalletData(walletData);
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
      }
    },
  });
}

export function useWalletBackupCheck(): WalletHealthCheck {
  const wallet = useCurrentWallet();

  const walletBackup = useWalletBackupQuery();
  const resolve = useWalletBackupMutation();

  const query = useQuery({
    queryKey: [
      "wallet-backup-check",
      wallet?.userEntryAddress,
      wallet?.previousWalletData,
    ],
    queryFn:
      wallet && walletBackup.data
        ? async () => {
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
                  serialize(backupKey.publicKey) !==
                  serialize(actualKey.publicKey)
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
          }
        : skipToken,
  });

  return {
    label: "Wallet backup is available",
    query,
    resolve,
  };
}

export function useWalletBackupIncludesEasyShareCheck(): WalletHealthCheck {
  const wallet = useCurrentWallet();

  const walletBackup = useWalletBackupQuery();
  const resolve = useWalletBackupMutation();

  const query = useQuery({
    queryKey: [
      "wallet-backup-includes-easy-share-check",
      wallet?.userEntryAddress,
      wallet?.previousWalletData,
    ],
    queryFn:
      wallet && walletBackup.data
        ? async () => {
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
          }
        : skipToken,
  });

  return {
    label: "Wallet backup includes easy share",
    query,
    resolve,
  };
}

export function useLocalDataIsUpToDateCheck(): WalletHealthCheck {
  const wallet = useCurrentWallet();
  const walletDataState = useWalletDataStateQuery();
  const router = useRouter();

  const query = useQuery({
    queryKey: [
      "local-data-is-up-to-date-check",
      wallet?.userEntryAddress,
      wallet?.previousWalletData,
    ],
    queryFn: walletDataState.data
      ? async () => {
          return walletDataState.data.type === WalletDataStateType.UpToDate;
        }
      : skipToken,
  });

  return {
    label: "Local data is up-to-date",
    query,
    resolve: useMutation({
      mutationFn: async () => {
        router.push("/dashboard/sync-wallet-data");
      },
    }),
  };
}

export function useWalletHasEasyShareCheck(): WalletHealthCheck {
  const wallet = useCurrentWallet();

  const query = useQuery({
    queryKey: ["wallet-has-easy-share", wallet?.userEntryAddress],
    queryFn: wallet
      ? async () => {
          return !!wallet.encryptedEasyShare;
        }
      : skipToken,
  });

  return {
    label: "Wallet has easy share",
    query,
  };
}
