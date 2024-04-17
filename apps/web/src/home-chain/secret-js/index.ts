import {
  EasyShareDecryption,
  MultisigKeyEncryption,
  SharesBackupEncryption,
} from "@/lib/encryption";
import { KeyMetaData } from "@/stores/key-meta-data";
import {
  WalletData,
  WalletDataBackup,
  NewWalletData,
} from "@/wallet-data-backup";
import { getOwnerData } from "@/wallet-data-backup/worker-client";
import {
  HomeChainId,
  MpcWallet,
  PendingRecoveryKeySchema,
  queryClient,
  QueryClientNamespace,
  Secp256k1PublicKey,
  SecretJsClient,
  Serialized,
  UsableKeySchema,
} from "@obi-wallet/sdk";
import invariant from "tiny-invariant";
import { z } from "zod";

export class SecretJsHomeChain {
  protected queryNamespace: QueryClientNamespace<
    "secret-js-home-chain",
    { chainId: HomeChainId }
  >;
  protected client: SecretJsClient;

  public constructor(protected chainId: HomeChainId) {
    this.queryNamespace = new QueryClientNamespace("secret-js-home-chain", {
      chainId,
    });
    this.client = new SecretJsClient(chainId);
  }

  public userEntryCodeHash(userEntryAddress: string) {
    return queryClient.fetchQuery(
      this.userEntryCodeHashQuery(userEntryAddress),
    );
  }

  public userEntryCodeHashQuery(userEntryAddress: string) {
    return this.queryNamespace.createQuery({
      name: "userEntryCodeHash",
      fn: async (userEntryAddress) => {
        const userEntryCodeHash = await this.client.withSecretNetworkClient(
          async (secretNetworkClient) => {
            const info = await secretNetworkClient.query.compute.contractInfo({
              contract_address: userEntryAddress,
            });
            const response =
              await secretNetworkClient.query.compute.codeHashByCodeId({
                code_id: info.contract_info?.code_id,
              });
            return response.code_hash;
          },
        );
        invariant(
          typeof userEntryCodeHash === "string",
          "userEntryCodeHash must be a string",
        );
        return userEntryCodeHash;
      },
      params: userEntryAddress,
    });
  }

  public userAccount(params: {
    userEntryAddress: string;
    userEntryCodeHash: string;
  }) {
    return queryClient.fetchQuery(this.userAccountQuery(params));
  }

  public userAccountQuery(params: {
    userEntryAddress: string;
    userEntryCodeHash: string;
  }) {
    return this.queryNamespace.createQuery({
      name: "userAccount",
      fn: async ({ userEntryAddress, userEntryCodeHash }) => {
        const schema = z.object({
          user_account_address: z.string(),
          user_account_code_hash: z.string(),
        });
        const response = await this.client.withSecretNetworkClient(
          async (client) => {
            return await client.query.compute.queryContract({
              contract_address: userEntryAddress,
              code_hash: userEntryCodeHash,
              query: { user_account_address: {} },
            });
          },
        );
        const userAccount = schema.parse(response);
        return {
          userAccountAddress: userAccount.user_account_address,
          userAccountCodeHash: userAccount.user_account_code_hash,
        };
      },
      params,
    });
  }

  public async getWalletData({
    wallet,
    keyMetaData,
  }: {
    wallet: Serialized<MpcWallet>;
    keyMetaData: KeyMetaData;
  }): Promise<NewWalletData> {
    const w = MpcWallet.create(wallet);
    async function getEncryptedEasyShare() {
      const easyShare = await new EasyShareDecryption(w.owner).decrypt(
        wallet.encryptedShares.easy,
      );
      return await new SharesBackupEncryption(w.owner).encryptEasyShare(
        easyShare,
      );
    }
    const encryptedEasyShare = await getEncryptedEasyShare();

    const encryptedKeyMetaData = await new MultisigKeyEncryption(
      w.owner.publicKey,
    ).encrypt(JSON.stringify(keyMetaData));

    const data: NewWalletData = {
      homeChainId: wallet.homeChain,
      userEntryAddress: wallet.userEntryAddress,
      owner: getOwnerData(wallet.owner),
      encryptedShares: {
        easy: encryptedEasyShare,
        backup: wallet.encryptedShares.backup,
      },
      encryptedKeyMetaData,
    };
    return NewWalletData.parse(data);
  }

  public async getWalletDataBackup({
    wallet,
    keyMetaData,
  }: {
    wallet: Serialized<MpcWallet>;
    keyMetaData: KeyMetaData;
  }): Promise<WalletDataBackup> {
    const w = MpcWallet.create(wallet);
    async function getEncryptedEasyShare() {
      if (!wallet.encryptedShares.easy) return undefined;

      const easyShare = await new EasyShareDecryption(w.owner).decrypt(
        wallet.encryptedShares.easy,
      );
      return await new SharesBackupEncryption(w.owner).encryptEasyShare(
        easyShare,
      );
    }
    const encryptedEasyShare = await getEncryptedEasyShare();

    const encryptedKeyMetaData = await new MultisigKeyEncryption(
      w.owner.publicKey,
    ).encrypt(JSON.stringify(keyMetaData));

    return WalletDataBackup.parse({
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
        encryptedEasyShare,
        encryptedBackupShare: wallet.encryptedShares.backup,
        encryptedKeyMetaData,
      },
    });
  }

  public async lookupWalletBackup(publicKey: Secp256k1PublicKey) {
    const response = await fetch(
      "https://proxy-wallets.obiwallet.workers.dev",
      {
        method: "POST",
        body: JSON.stringify({
          chainId: this.chainId,
          publicKey: publicKey.value,
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
    if (response.status === 404) {
      console.log("No wallets found");
      return [];
    }

    const schema = z.array(WalletData);
    const result = schema.safeParse(await response.json());
    if (!result.success) {
      throw new Error(`Failed to parse proxy wallets: ${result.error}`);
    }
    return result.data;
  }
}
