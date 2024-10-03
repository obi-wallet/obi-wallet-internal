import {
  EasyShareDecryption,
  MultisigKeyEncryption,
  SharesBackupEncryption,
} from "@/lib/encryption";
import { rootStore } from "@/stores";
import { KeyMetaData } from "@/stores/key-meta-data";
import { LegacyWalletData, LegacyWalletDataBackup } from "@/wallet-data-backup";
import {
  getOwnerData,
  lookupPublicKey,
} from "@/wallet-data-backup/worker-client";
import { Encoding, HexEncodedString } from "@obi-wallet/encoding";
import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import {
  HomeChainId,
  MpcWallet,
  PendingRecoveryKeySchema,
  Secp256k1PublicKey,
  SecretJsClient,
  SecretJsHomeChains,
  Serialized,
  UsableKeySchema,
  WalletData,
} from "@obi-wallet/sdk";
import { Ed25519PublicKey } from "@obi-wallet/sdk-ed25519";
import { serialize } from "@obi-wallet/sdk-json";
import { ObiAccountPublicKeys } from "@obi-wallet/sdk-obi-account";
import invariant from "tiny-invariant";
import { z } from "zod";

export class SecretJsHomeChain {
  protected queryNamespace: QueryClientNamespace<
    "secret-js-home-chain",
    { chainId: HomeChainId }
  >;
  protected client: SecretJsClient;
  protected chain: (typeof SecretJsHomeChains)[HomeChainId];

  public constructor(protected chainId: HomeChainId) {
    this.queryNamespace = new QueryClientNamespace("secret-js-home-chain", {
      chainId,
    });
    this.client = new SecretJsClient(chainId);
    this.chain = SecretJsHomeChains[chainId];
  }

  public userEntryCodeHash(userEntryAddress: string) {
    return queryClient.fetchQuery(
      this.userEntryCodeHashQuery(userEntryAddress),
    );
  }

  public get userEntryCodeHashQuery() {
    return this.queryNamespace.createQuery({
      name: "userEntryCodeHash",
      fn: async (userEntryAddress: string) => {
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
    });
  }

  public userAccount(params: {
    userEntryAddress: string;
    userEntryCodeHash: string;
  }) {
    return queryClient.fetchQuery(this.userAccountQuery(params));
  }

  public get userAccountQuery() {
    return this.queryNamespace.createQuery({
      name: "userAccount",
      fn: async ({
        userEntryAddress,
        userEntryCodeHash,
      }: {
        userEntryAddress: string;
        userEntryCodeHash: string;
      }) => {
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
    });
  }

  public async getWalletData({
    wallet,
    keyMetaData,
  }: {
    wallet: Serialized<MpcWallet>;
    keyMetaData: KeyMetaData;
  }): Promise<WalletData> {
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
    ).encrypt(serialize(keyMetaData));

    const data: WalletData = {
      homeChainId: wallet.homeChain,
      userEntryAddress: wallet.userEntryAddress,
      owner: getOwnerData(wallet.owner),
      encryptedShares: {
        easy: encryptedEasyShare,
        backup: wallet.encryptedShares.backup,
      },
      encryptedKeyMetaData,
      ed25519KeyPair: wallet.ed25519KeyPair ? wallet.ed25519KeyPair : undefined,
      revision: wallet.previousWalletData?.revision ?? 0,
    };
    return WalletData.parse(data);
  }

  public async getWalletDataBackup({
    wallet,
    keyMetaData,
  }: {
    wallet: Serialized<MpcWallet>;
    keyMetaData: KeyMetaData;
  }): Promise<LegacyWalletDataBackup> {
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
    ).encrypt(serialize(keyMetaData));

    return LegacyWalletDataBackup.parse({
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

            throw new Error(`Invalid key: ${serialize(key)}`);
          }),
        },
        encryptedEasyShare,
        encryptedBackupShare: wallet.encryptedShares.backup,
        encryptedKeyMetaData,
      },
    });
  }

  public async lookupWalletBackup({
    homeChainId,
    publicKey,
  }: {
    homeChainId: HomeChainId;
    publicKey: Secp256k1PublicKey;
  }): Promise<WalletData | null> {
    const response = await lookupPublicKey({
      homeChainId,
      publicKey,
    });

    if (response.status === 200) {
      return WalletData.parse(await response.json());
    }

    return null;
  }

  public async lookupLegacyWalletBackups(publicKey: Secp256k1PublicKey) {
    const response = await fetch(
      "https://proxy-wallets.obiwallet.workers.dev",
      {
        method: "POST",
        body: serialize({
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

    const schema = z.array(LegacyWalletData);
    const result = schema.safeParse(await response.json());
    if (!result.success) {
      throw new Error(
        `Failed to parse proxy wallets: ${serialize(result.error)}`,
      );
    }
    return result.data;
  }

  public async publicKeys(
    userEntryAddresss: string,
  ): Promise<ObiAccountPublicKeys> {
    const [secp256k1, ed25519] = await Promise.all([
      this.secp256k1PublicKey(userEntryAddresss),
      this.ed25519PublicKey(userEntryAddresss),
    ]);
    return {
      secp256k1,
      ed25519,
    };
  }

  public secp256k1PublicKey(userEntryAddress: string) {
    return queryClient.fetchQuery(
      this.secp256k1PublicKeyQuery(userEntryAddress),
    );
  }
  public get secp256k1PublicKeyQuery() {
    return this.queryNamespace.createQuery({
      name: "sec256k1PublicKey",
      fn: this.secp256k1PublicKeyQueryFn.bind(this),
      staleTime: { day: 1 },
    });
  }
  protected async secp256k1PublicKeyQueryFn(
    userEntryAddress: string,
  ): Promise<Secp256k1PublicKey> {
    const response = await this.client.queryContract({
      contract: this.chain.secretSigner.address,
      codeHash: this.chain.secretSigner.codeHash,
      query: {
        passport_pubkey: { user_entry_address: userEntryAddress },
      },
      schema: HexEncodedString,
    });

    return {
      type: "tendermint/PubKeySecp256k1",
      value: Encoding.concat(
        // Append missing first byte
        Encoding.fromHex(HexEncodedString.parse("04")),
        Encoding.fromHex(response),
      ).toBase64(),
    };
  }

  public ed25519PublicKey(userEntryAddress: string) {
    return queryClient.fetchQuery(this.ed25519PublicKeyQuery(userEntryAddress));
  }
  public get ed25519PublicKeyQuery() {
    return this.queryNamespace.createQuery({
      name: "ed25519PublicKey",
      fn: this.ed25519PublicKeyQueryFn.bind(this),
    });
  }
  protected async ed25519PublicKeyQueryFn(
    userEntryAddress: string,
  ): Promise<Ed25519PublicKey | null> {
    const wallet =
      rootStore.current?.mpcWalletsStore.getWalletByUserEntryAddress(
        userEntryAddress,
      );
    const value = wallet?.ed25519PublicKey;

    if (!value) return null;

    return {
      type: "tendermint/PubKeyEd25519",
      value,
    };
  }
}
