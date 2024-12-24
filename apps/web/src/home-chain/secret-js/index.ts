import { MultisigKeyEncryption } from "@/lib/encryption";
import { KeyMetaData } from "@/stores/key-meta-data";
import { LegacyWalletData } from "@/wallet-data-backup";
import {
  getOwnerData,
  lookupPublicKey,
} from "@/wallet-data-backup/worker-client";
import { Encoding, HexEncodedString } from "@obi-wallet/encoding";
import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import {
  EncryptedEasyShareForBackup,
  HomeChainId,
  MpcWallet,
  BackedUpMpcWalletSchema,
  parsePrimaryKeyEncryptedData,
  Secp256k1PublicKey,
  SecretJsClient,
  SecretJsHomeChains,
  UserEntryAddress,
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

  public userEntryCodeHash(userEntryAddress: UserEntryAddress) {
    return queryClient.fetchQuery(
      this.userEntryCodeHashQuery(userEntryAddress),
    );
  }

  public get userEntryCodeHashQuery() {
    return this.queryNamespace.createQuery({
      name: "userEntryCodeHash",
      fn: async (userEntryAddress: UserEntryAddress) => {
        const userEntryCodeHash = await this.client.withSecretNetworkClient(
          async (secretNetworkClient) => {
            const info = await secretNetworkClient.query.compute.contractInfo({
              contract_address: userEntryAddress,
            });
            const response =
              await secretNetworkClient.query.compute.codeHashByCodeId({
                ...(info.contract_info?.code_id
                  ? { code_id: info.contract_info.code_id }
                  : {}),
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
    userEntryAddress: UserEntryAddress;
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
        userEntryAddress: UserEntryAddress;
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
    wallet: z.infer<typeof BackedUpMpcWalletSchema>;
    keyMetaData: KeyMetaData;
  }): Promise<WalletData> {
    const w = MpcWallet.create(wallet);
    async function getEncryptedEasyShare() {
      const [_primaryKeyEncrypted, multisigKeyEncrypted] =
        parsePrimaryKeyEncryptedData(wallet.encryptedShares.easy);
      return EncryptedEasyShareForBackup.parse(multisigKeyEncrypted);
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

  public async publicKeys(wallet: MpcWallet): Promise<ObiAccountPublicKeys> {
    const [secp256k1, ed25519] = await Promise.all([
      this.secp256k1PublicKey(wallet),
      this.ed25519PublicKey(wallet),
    ]);
    return {
      secp256k1,
      ed25519,
    };
  }

  public get secp256k1PublicKeyQuery() {
    return this.queryNamespace.createQuery({
      name: "secp256k1PublicKey",
      fn: this.secp256k1PublicKey.bind(this),
      staleTime: { day: 1 },
    });
  }

  public async secp256k1PublicKey(
    wallet: MpcWallet,
  ): Promise<Secp256k1PublicKey> {
    if (wallet.secp256k1PublicKey) {
      return {
        type: "tendermint/PubKeySecp256k1",
        value: wallet.secp256k1PublicKey,
      };
    }
    if (wallet.userEntryAddress) {
      const response = await this.client.queryContract({
        contract: this.chain.secretSigner.address,
        codeHash: this.chain.secretSigner.codeHash,
        query: {
          passport_pubkey: { user_entry_address: wallet.userEntryAddress },
        },
        schema: HexEncodedString,
      });

      const secp256k1PublicKey: Secp256k1PublicKey = {
        type: "tendermint/PubKeySecp256k1",
        value: Encoding.concat(
          // Append missing first byte
          Encoding.fromHex(HexEncodedString.parse("04")),
          Encoding.fromHex(response),
        ).toBase64(),
      };
      wallet.setSecp256k1KeyPair({
        publicKey: secp256k1PublicKey.value,
      });
      return secp256k1PublicKey;
    }
    invariant(
      false,
      "Neither secp256k1 public key nor user entry address found",
    );
  }

  public ed25519PublicKey(wallet: MpcWallet) {
    return queryClient.fetchQuery(this.ed25519PublicKeyQuery(wallet));
  }
  public get ed25519PublicKeyQuery() {
    return this.queryNamespace.createQuery({
      name: "ed25519PublicKey",
      fn: this.ed25519PublicKeyQueryFn.bind(this),
    });
  }
  protected async ed25519PublicKeyQueryFn(
    wallet: MpcWallet,
  ): Promise<Ed25519PublicKey | null> {
    const value = wallet.ed25519PublicKey;

    if (!value) return null;

    return {
      type: "tendermint/PubKeyEd25519",
      value,
    };
  }
}
