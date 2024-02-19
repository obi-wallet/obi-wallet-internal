import {
  MpcWallet,
  PendingRecoveryKeySchema,
  UsableKeySchema,
} from "@obi-wallet/sdk";
import { z } from "zod";

export async function backupWallet({
  wallet,
  userData,
}: {
  wallet: z.infer<typeof MpcWallet.schema.migratableSchema>;
  userData: {
    name: string;
    avatar: string;
  };
}) {
  const response = await fetch(
    "https://proxy-wallets.obiwallet.workers.dev/add",
    {
      method: "POST",
      body: JSON.stringify({
        chainId: wallet.homeChain,
        proxyWallet: {
          proxyAddress: {
            address: wallet.userEntryAddress,
          },
          owner: {
            threshold: String(wallet.owner.threshold),
            keys: wallet.owner.keys.map((key) => {
              const usableKeyResponse =
                UsableKeySchema.migratableSchema.safeParse(key);
              if (usableKeyResponse.success) {
                return {
                  type: usableKeyResponse.data.type,
                  publicKey: usableKeyResponse.data.payload.publicKey,
                };
              }
              const pendingRecoveryKeyResponse =
                PendingRecoveryKeySchema.migratableSchema.safeParse(key);
              if (pendingRecoveryKeyResponse.success) {
                return {
                  type: pendingRecoveryKeyResponse.data.payload.type,
                  publicKey: pendingRecoveryKeyResponse.data.payload.publicKey,
                };
              }

              throw new Error(`Invalid key: ${JSON.stringify(key)}`);
            }),
          },
          userData,
          encryptedBackupShare: wallet.encryptedShares.backup,
        },
      }),
      headers: {
        "Api-Version": "v1",
        Env:
          process.env.NEXT_PUBLIC_ENV === "production"
            ? "production"
            : "staging",
      },
    },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to backup wallet: ${response.status}`);
  }
}
