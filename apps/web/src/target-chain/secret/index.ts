import { IntentionsPayload } from "@/keys/intentions-handler";
import { CosmosTokenRegistry } from "@/target-chain/cosmos/token-registry";
import {
  SecretChainData,
  SecretChainId,
  SecretChains,
} from "@/target-chain/secret/chains";
import { SecretMpcSigner } from "@/target-chain/secret/mpc-signer";
import { IntentionsResults } from "@/user-interactions/approve-intentions";
import { Chain } from "@chain-registry/types";
import { GasPrice, StdFee } from "@cosmjs/stargate";
import { queryClient } from "@obi-wallet/query-client";
import {
  MpcWallet,
  SecretJsClient,
  SecretJsHomeChainId,
} from "@obi-wallet/sdk";
import {
  AbstractTargetChain,
  AssetId,
  Caip19Asset,
} from "@obi-wallet/sdk-abstract-target-chain";
import {
  Caip19AssetId,
  parseCaip19AssetId,
  parseCaip2ChainId,
} from "@obi-wallet/sdk-caip";
import {
  getSec256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import {
  SessionRequestPayload,
  SessionRequestResponse,
} from "@obi-wallet/wallet-connect";
import { getSdkError } from "@walletconnect/utils";
import { bech32 } from "bech32";
import { chains } from "chain-registry";
import { Msg, pubkeyToAddress } from "secretjs";
import invariant from "tiny-invariant";

export class SecretTargetChain extends AbstractTargetChain<SecretChainId> {
  public readonly secretChainId: SecretJsHomeChainId;
  protected readonly chainData: SecretChainData;
  protected readonly chain: Chain;
  protected readonly client: SecretJsClient;
  protected readonly tokenRegistry: CosmosTokenRegistry;

  public constructor(chainId: SecretChainId) {
    super(chainId);
    this.chainData = SecretChains[chainId];
    const { reference } = parseCaip2ChainId(chainId);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    this.secretChainId = reference as SecretJsHomeChainId;
    this.client = new SecretJsClient(this.secretChainId);
    const chain = chains.find((c) => {
      return c.chain_id === reference;
    });
    invariant(chain, `Chain not found for ${reference}`);
    this.chain = chain;
    this.tokenRegistry = CosmosTokenRegistry.getInstance();
  }

  public get label() {
    return this.chainData.name;
  }

  public get image() {
    return this.chainData.image;
  }

  public get disabled() {
    return this.chainData.disabled ?? false;
  }

  public computeAddress(publicKey: Secp256k1PublicKey): string {
    return pubkeyToAddress(
      getSec256k1CompressedPublicKey(publicKey),
      this.chainData.prefix,
    );
  }

  protected async obiAccountAddressQueryFn(publicKey: Secp256k1PublicKey) {
    return this.computeAddress(publicKey);
  }

  public isNativeAsset(assetId: Caip19AssetId) {
    const { chainId, namespace } = parseCaip19AssetId(assetId);
    return (
      chainId === this.chainId &&
      (namespace === "native" || namespace === "factory" || namespace === "ibc")
    );
  }

  public isTokenAsset(assetId: Caip19AssetId) {
    const { chainId, namespace } = parseCaip19AssetId(assetId);
    return chainId === this.chainId && namespace === "cw20";
  }

  public async nativeBalancesQueryFn(address: string) {
    return await this.client.withSecretNetworkClient(async (client) => {
      const balances = await client.query.bank.allBalances({
        address,
      });
      return (balances.balances ?? [])
        .map((balance) => {
          return {
            assetId: balance.denom
              ? this.denomToCaip19AssetId(balance.denom)
              : null,
            rawAmount: balance.amount,
          };
        })
        .filter((balance): balance is Caip19Asset => {
          return !!balance.assetId;
        });
    });
  }

  public async tokenBalanceQueryFn(_: {
    address: string;
    assetId: Caip19AssetId;
  }) {
    // TODO: here we also need to fetch the viewing key, probably via store
    return "0";
  }

  public async priceQueryFn(_id: AssetId) {
    // TODO:
    return { usdValue: "0" };
  }

  public async newPriceQueryFn(_id: Caip19AssetId) {
    // TODO:
    return { usdValue: "0" };
  }

  protected denomMetadata(denom: string) {
    return queryClient.fetchQuery(this.denomMetadataQuery(denom));
  }
  protected get denomMetadataQuery() {
    return this.queryNamespace.createQuery({
      name: "denomMetadata",
      fn: this.denomMetadataQueryFn.bind(this),
      staleTime: { day: 1 },
    });
  }
  protected async denomMetadataQueryFn(denom: string) {
    return await this.client.withSecretNetworkClient(async (client) => {
      const response = await client.query.bank.denomMetadata({
        denom,
      });
      return response.metadata;
    });
  }

  public tokenInfo(contract: string) {
    return queryClient.fetchQuery(this.tokenInfoQuery(contract));
  }
  public get tokenInfoQuery() {
    return this.queryNamespace.createQuery({
      name: "tokenInfo",
      fn: this.tokenInfoQueryFn.bind(this),
      staleTime: { day: 1 },
    });
  }
  public async tokenInfoQueryFn(contract: string) {
    return await this.client.withSecretNetworkClient(async (client) => {
      const info = await client.query.compute.contractInfo({
        contract_address: contract,
      });
      const response = await client.query.compute.codeHashByCodeId({
        code_id: info.contract_info?.code_id,
      });
      const { token_info } = await client.query.compute.queryContract<
        {
          token_info: unknown;
        },
        {
          token_info: {
            name: string;
            symbol: string;
            decimals: number;
            total_supply: string;
          };
        }
      >({
        contract_address: contract,
        code_hash: response.code_hash,
        query: {
          token_info: {},
        },
      });
      return token_info;
    });
  }

  public async calculateFee({
    messages,
  }: {
    wallet: MpcWallet;
    messages: unknown[];
    memo: string;
  }) {
    invariant(this.validateMessages(messages), "Invalid messages");
    return this.client.defaultFee;
  }

  public async calculateHashToSign({
    wallet,
    messages,
    memo,
  }: {
    wallet: MpcWallet;
    fee: StdFee;
    messages: unknown[];
    memo: string;
  }): Promise<Uint8Array> {
    invariant(this.validateMessages(messages), "Invalid messages");
    const signer = await this.getSigner(wallet);
    return await signer.mpcSigner.calculateHashToSign(async () => {
      await this.client.withSigningSecretNetworkClient(
        signer,
        async (client) => {
          await client.tx.signTx(messages, {
            ...this.client.defaultTxOptions,
            memo,
          });
        },
      );
    });
  }

  public async sign({
    wallet,
    messages,
    memo,
    intentionsPayload,
    intentionsResults,
  }: {
    wallet: MpcWallet;
    fee: StdFee;
    messages: unknown[];
    memo: string;
    intentionsPayload: IntentionsPayload;
    intentionsResults: IntentionsResults;
  }) {
    invariant(this.validateMessages(messages), "Invalid messages");

    const signer = await this.getSigner(wallet);
    signer.mpcSigner.addIntentionsResults({
      payload: intentionsPayload,
      results: intentionsResults,
    });
    return await this.client.withSigningSecretNetworkClient(
      signer,
      async (client) => {
        return await client.tx.signTx(messages, {
          ...this.client.defaultTxOptions,
          memo,
        });
      },
    );
  }

  public async signAndBroadcast({
    wallet,
    messages,
    memo,
    intentionsPayload,
    intentionsResults,
  }: {
    wallet: MpcWallet;
    fee: StdFee;
    messages: unknown[];
    memo: string;
    intentionsPayload: IntentionsPayload;
    intentionsResults: IntentionsResults;
  }) {
    invariant(this.validateMessages(messages), "Invalid messages");

    const signer = await this.getSigner(wallet);
    signer.mpcSigner.addIntentionsResults({
      payload: intentionsPayload,
      results: intentionsResults,
    });
    return await this.client.withSigningSecretNetworkClient(
      signer,
      async (client) => {
        return await client.tx.broadcast(messages, {
          ...this.client.defaultTxOptions,
          memo,
        });
      },
    );
  }

  protected get gasPrice() {
    const firstFeeToken = this.chain.fees?.fee_tokens[0];
    return firstFeeToken
      ? GasPrice.fromString(
          `${firstFeeToken.average_gas_price}${firstFeeToken.denom}`,
        )
      : undefined;
  }

  public async getSigner(wallet: MpcWallet) {
    return await SecretMpcSigner.fromWallet(wallet, this.chainData.id);
  }

  public validateMessages(messages: unknown[]): messages is Msg[] {
    return messages.every((msg) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return typeof (msg as Msg).toProto === "function";
    });
  }

  public assetInfo(denom: string) {
    const asset = this.tokenRegistry.getAsset({
      chainId: this.chainData.id,
      denom,
    });
    if (!asset) return null;

    const denomUnit = asset.denom_units.find((value) => {
      return value.denom === asset.display;
    });

    return {
      name: asset.name,
      symbol: asset.symbol,
      decimals: denomUnit?.exponent ?? 0,
      image: asset.images?.[0]?.svg ?? asset.images?.[0]?.png ?? null,
    };
  }

  public async newAssetInfo(id: Caip19AssetId) {
    const asset = this.tokenRegistry.getNewAsset(id);

    if (asset) {
      const denomUnit = asset.denom_units.find((value) => {
        return value.denom === asset.display;
      });

      return {
        name: asset.name,
        symbol: asset.symbol,
        decimals: denomUnit?.exponent ?? 0,
        image: asset.images?.[0]?.svg ?? asset.images?.[0]?.png ?? null,
      };
    }

    const { namespace, reference } = parseCaip19AssetId(id);
    switch (namespace) {
      case "factory": {
        const denom = `factory/${reference.replace("%2F", "/")}`;
        try {
          const metadata = await this.denomMetadata(denom);
          if (!metadata) return null;

          const denomUnit = (metadata.denom_units ?? []).find((value) => {
            return value.denom === metadata.display;
          });

          return {
            name: metadata.name ?? "",
            symbol: metadata.symbol ?? "",
            decimals: denomUnit?.exponent ?? 0,
            image: null,
          };
        } catch (e) {
          console.error(e);
          return null;
        }
      }
      case "cw20": {
        const tokenInfo = await this.tokenInfo(reference);
        if (!tokenInfo) return null;

        return {
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
          image: null,
        };
      }
    }

    return asset ?? null;
  }

  public validateAddress(address: string): boolean {
    const { prefix } = bech32.decode(address);
    return prefix === this.chainData.prefix;
  }

  // TODO: aminoTypes
  // TODO: registry
  // TODO: getSupportedWalletConnectNamespaces

  // TODO:
  public async handleWalletConnectSessionRequest(
    _: SessionRequestPayload,
  ): Promise<SessionRequestResponse> {
    return { error: getSdkError("WC_METHOD_UNSUPPORTED") };
  }

  public denomToCaip19AssetId(denom: string): Caip19AssetId | null {
    if (denom.startsWith("factory/")) {
      return `${this.chainId}/factory:${denom.replace("factory/", "").replace("/", "%2F")}`;
    }

    if (denom.startsWith("ibc/")) {
      return `${this.chainId}/ibc:${denom.replace("ibc/", "").replace("/", "%2F")}`;
    }

    if (denom.startsWith(this.chainData.prefix)) {
      return `${this.chainId}/cw20:${denom.replace("/", "%2F")}`;
    }

    return `${this.chainId}/native:${denom}`;
  }

  public caip19AssetIdToDenom(assetId: Caip19AssetId): string | null {
    const { namespace, reference } = parseCaip19AssetId(assetId);
    switch (namespace) {
      case "native":
        return reference.replace("%2F", "/");
      case "factory":
        return `factory/${reference.replace("%2F", "/")}`;
      case "ibc":
        return `ibc/${reference.replace("%2F", "/")}`;
      case "cw20":
        return `cw20/${reference.replace("%2F", "/")}`;
      default:
        return null;
    }
  }
}
