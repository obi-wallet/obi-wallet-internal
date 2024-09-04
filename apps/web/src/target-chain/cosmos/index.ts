import { HomeChain } from "@/home-chain";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { rootStore } from "@/stores";
import {
  allCosmosChains,
  CosmosChainData,
  CosmosChainId,
  CosmosChains,
} from "@/target-chain/cosmos/chains";
import { CosmosMpcSigner } from "@/target-chain/cosmos/mpc-signer";
import { IntentionsResults } from "@/user-interactions/approve-intentions";
import { CosmosSignAminoUserInteraction } from "@/user-interactions/sign-and-broadcast/evm/cosmos-sign-amino";
import { CosmosSignDirectUserInteraction } from "@/user-interactions/sign-and-broadcast/evm/cosmos-sign-direct";
import { Chain } from "@chain-registry/types";
import {
  CosmWasmClient,
  createWasmAminoConverters,
  SigningCosmWasmClient,
  wasmTypes,
} from "@cosmjs/cosmwasm-stargate";
import { EncodeObject, OfflineSigner, Registry } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  calculateFee,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  createVestingAminoConverters,
  defaultRegistryTypes,
  GasPrice,
  QueryClient,
  setupBankExtension,
  SigningStargateClient,
  StargateClient,
  StdFee,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { Encoding } from "@obi-wallet/encoding";
import { queryClient } from "@obi-wallet/query-client";
import { MpcWallet } from "@obi-wallet/sdk";
import {
  AbstractTargetChain,
  AssetInfo,
  Caip19Asset,
} from "@obi-wallet/sdk-abstract-target-chain";
import { AssetRegistry } from "@obi-wallet/sdk-asset-registry";
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
import { pubkeyToAddress } from "secretjs";
import invariant from "tiny-invariant";
import { z } from "zod";

const EncodeObjectSchema = z.object({
  typeUrl: z.string(),
  value: z.unknown(),
});

export function isEncodeObject(message: unknown): message is EncodeObject {
  return EncodeObjectSchema.safeParse(message).success;
}

const StdFeeSchema = z.object({
  amount: z.array(z.object({ amount: z.string(), denom: z.string() })),
  gas: z.string(),
});

function isStdFee(fee: unknown): fee is StdFee {
  return StdFeeSchema.safeParse(fee).success;
}

export class CosmosTargetChain extends AbstractTargetChain<CosmosChainId> {
  public readonly cosmosChainId: string;
  protected readonly chainData: CosmosChainData;
  protected readonly chain: Chain;

  public constructor(chainId: CosmosChainId) {
    super(chainId);
    this.chainData = CosmosChains[chainId];
    const { reference } = parseCaip2ChainId(chainId);
    this.cosmosChainId = reference;
    const chain = chains.find((c) => {
      return c.chain_id === reference;
    });
    invariant(chain, `Chain not found for ${reference}`);
    this.chain = chain;
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

  public computeAddress(publicKey: Secp256k1PublicKey) {
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
    return await this.withStargateClient(async (client) => {
      const balances = await client.getAllBalances(address);
      return balances
        .map((balance) => {
          return {
            assetId: this.denomToCaip19AssetId(balance.denom),
            rawAmount: balance.amount,
          };
        })
        .filter((balance): balance is Caip19Asset => {
          return !!balance.assetId;
        });
    });
  }

  public async tokenBalanceQueryFn({
    address,
    assetId,
  }: {
    address: string;
    assetId: Caip19AssetId;
  }) {
    const { namespace, reference } = parseCaip19AssetId(assetId);
    switch (namespace) {
      case "cw20": {
        return await this.withCosmWasmClient(async (client) => {
          const response = await client.queryContractSmart(reference, {
            balance: {
              address,
            },
          });
          return response.balance;
        });
      }
    }
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
    return await this.withTendermint34Client(async (client) => {
      const queryClient = new QueryClient(client);
      const bankExtension = setupBankExtension(queryClient);
      return await bankExtension.bank.denomMetadata(denom);
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
    return await this.withCosmWasmClient(async (client) => {
      return await client.queryContractSmart(contract, { token_info: {} });
    });
  }

  public async withTendermint34Client<T>(
    f: (client: Tendermint34Client) => Promise<T>,
  ) {
    const client = await this.createTendermint34Client();
    try {
      return await f(client);
    } finally {
      client.disconnect();
    }
  }

  public async withStargateClient<T>(
    f: (client: StargateClient) => Promise<T>,
  ) {
    const client = await this.createStargateClient();
    try {
      return await f(client);
    } finally {
      client.disconnect();
    }
  }

  public async withSigningStargateClient<T>(
    signer: OfflineSigner,
    f: (client: SigningStargateClient) => Promise<T>,
  ) {
    const client = await this.createSigningStargateClient(signer);
    try {
      return await f(client);
    } finally {
      client.disconnect();
    }
  }

  public async withCosmWasmClient<T>(
    f: (client: CosmWasmClient) => Promise<T>,
  ) {
    const client = await this.createCosmWasmClient();
    try {
      return await f(client);
    } finally {
      client.disconnect();
    }
  }

  public async withSigningCosmWasmClient<T>(
    signer: OfflineSigner,
    f: (client: SigningCosmWasmClient) => Promise<T>,
  ) {
    const client = await this.createSigningCosmWasmClient(signer);
    try {
      return await f(client);
    } finally {
      client.disconnect();
    }
  }

  protected async createTendermint34Client() {
    const rpcs = this.chainData.rpcs;
    for (const rpc of rpcs) {
      try {
        return await Tendermint34Client.connect(rpc);
      } catch (e) {
        console.error(e);
      }
    }
    throw new Error("No RPC connected");
  }

  protected async createStargateClient() {
    const rpcs = this.chainData.rpcs;
    for (const rpc of rpcs) {
      try {
        return await StargateClient.connect(rpc);
      } catch (e) {
        console.error(e);
      }
    }
    throw new Error("No RPC connected");
  }

  protected async createSigningStargateClient(signer: OfflineSigner) {
    const rpcs = this.chainData.rpcs;
    for (const rpc of rpcs) {
      try {
        return await SigningStargateClient.connectWithSigner(rpc, signer, {
          gasPrice: this.gasPrice,
        });
      } catch (e) {
        console.error(e);
      }
    }
    throw new Error("No RPC connected");
  }

  protected async createCosmWasmClient() {
    const rpcs = this.chainData.rpcs;
    for (const rpc of rpcs) {
      try {
        return await CosmWasmClient.connect(rpc);
      } catch (e) {
        console.error(e);
      }
    }
    throw new Error("No RPC connected");
  }

  protected async createSigningCosmWasmClient(signer: OfflineSigner) {
    const rpcs = this.chainData.rpcs;
    for (const rpc of rpcs) {
      try {
        return await SigningCosmWasmClient.connectWithSigner(rpc, signer);
      } catch (e) {
        console.error(e);
      }
    }
    throw new Error("No RPC connected");
  }

  public async calculateFee({
    wallet,
    messages,
    memo,
  }: {
    wallet: MpcWallet;
    messages: unknown[];
    memo: string;
  }) {
    invariant(this.validateMessages(messages), "Invalid messages");

    const signer = await this.getSigner(wallet);
    return await this.withSigningCosmWasmClient(signer, async (client) => {
      if (!this.gasPrice) return undefined;

      const gasEstimation = await client.simulate(
        signer.address,
        messages,
        memo,
      );
      return calculateFee(Math.round(gasEstimation * 2), this.gasPrice);
    });
  }

  public async calculateHashToSign({
    wallet,
    fee,
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
      await this.withSigningCosmWasmClient(signer, async (client) => {
        await client.sign(signer.address, messages, fee, memo);
      });
    });
  }

  public async sign({
    wallet,
    fee,
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
    return await this.withSigningCosmWasmClient(signer, async (client) => {
      return await client.sign(signer.address, messages, fee, memo);
    });
  }

  public async signAndBroadcast({
    wallet,
    fee,
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
    return await this.withSigningCosmWasmClient(signer, async (client) => {
      return await client.signAndBroadcast(signer.address, messages, fee, memo);
    });
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
    return await CosmosMpcSigner.fromWallet(wallet, this.chainData.id);
  }

  public validateMessages(messages: unknown[]): messages is EncodeObject[] {
    return messages.every(isEncodeObject);
  }

  public validateFee(fee: unknown): fee is StdFee {
    return isStdFee(fee);
  }

  public async assetInfo(id: Caip19AssetId): Promise<AssetInfo | null> {
    const asset = await AssetRegistry.getInstance().byId(id);
    if (asset?.assetInfo) return asset.assetInfo;

    const { namespace, reference } = parseCaip19AssetId(id);
    switch (namespace) {
      case "factory": {
        const denom = `factory/${reference.replace("%2F", "/")}`;
        try {
          const metadata = await this.denomMetadata(denom);

          const denomUnit = metadata.denomUnits.find((value) => {
            return value.denom === metadata.display;
          });

          return {
            name: metadata.name,
            symbol: metadata.symbol,
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

    return null;
  }

  public validateAddress(address: string): boolean {
    try {
      const { prefix } = bech32.decode(address);
      return prefix === this.chainData.prefix;
    } catch {
      return false;
    }
  }

  public get aminoTypes() {
    return new AminoTypes({
      ...createAuthzAminoConverters(),
      ...createBankAminoConverters(),
      ...createDistributionAminoConverters(),
      ...createGovAminoConverters(),
      ...createStakingAminoConverters(),
      ...createIbcAminoConverters(),
      ...createFeegrantAminoConverters(),
      ...createVestingAminoConverters(),
      ...createWasmAminoConverters(),
      ...createFeegrantAminoConverters(),
    });
  }

  public get registry() {
    return new Registry([...defaultRegistryTypes, ...wasmTypes]);
  }

  public static async getSupportedWalletConnectNamespaces() {
    const wallet = rootStore.current?.mpcWalletsStore.currentWallet;
    invariant(wallet, "Wallet not found");
    const publicKey = await HomeChain.chainId(wallet.homeChainId).publicKey(
      wallet.userEntryAddress,
    );

    const cosmosChains = allCosmosChains
      .map((targetChainId) => {
        return new CosmosTargetChain(targetChainId);
      })
      .filter((chain) => {
        return !chain.disabled;
      });

    return {
      cosmos: {
        chains: cosmosChains.map((chain) => {
          return chain.chainId;
        }),
        methods: [
          "cosmos_getAccounts",
          "cosmos_signAmino",
          "cosmos_signDirect",
        ],
        accounts: await Promise.all(
          cosmosChains.map(async (chain) => {
            const address = await chain.obiAccountAddressQueryFn(publicKey);
            return `${chain.chainId}:${address}`;
          }),
        ),
        events: ["chainChanged", "accountsChanged"],
      },
    };
  }

  public async handleWalletConnectSessionRequest({
    request,
    chainId,
  }: SessionRequestPayload): Promise<SessionRequestResponse> {
    const wallet = rootStore.current?.mpcWalletsStore.currentWallet;
    if (!wallet) {
      return { error: getSdkError("USER_DISCONNECTED") };
    }

    switch (request.method) {
      case "cosmos_getAccounts": {
        const publicKey = await HomeChain.chainId(wallet.homeChainId).publicKey(
          wallet.userEntryAddress,
        );
        const cosmosChains = allCosmosChains
          .map((targetChainId) => {
            return new CosmosTargetChain(targetChainId);
          })
          .filter((chain) => {
            return chain.chainId === chainId;
          })
          .filter((chain) => {
            return !chain.disabled;
          });

        const result = await Promise.all(
          cosmosChains.map(async (targetChain) => {
            return {
              algo: "secp256k1",
              address: await targetChain.obiAccountAddress(publicKey),
              pubkey: Encoding.fromBytes(
                getSec256k1CompressedPublicKey(publicKey),
              ).toBase64(),
            };
          }),
        );
        return { result };
      }
      case "cosmos_signAmino": {
        const response = await CosmosSignAminoUserInteraction.start({
          walletMeta: {
            userEntryAddress: wallet.userEntryAddress,
          },
          cancelable: true,
          signerAddress: request.params.signerAddress,
          signDoc: request.params.signDoc,
        });
        if (response.approved) {
          return { result: response.payload };
        } else {
          return { error: getSdkError("USER_REJECTED") };
        }
      }
      case "cosmos_signDirect": {
        const response = await CosmosSignDirectUserInteraction.start({
          walletMeta: {
            userEntryAddress: wallet.userEntryAddress,
          },
          cancelable: true,
          signerAddress: request.params.signerAddress,
          signDoc: request.params.signDoc,
        });
        if (response.approved) {
          return { result: response.payload };
        } else {
          return { error: getSdkError("USER_REJECTED") };
        }
      }
      default:
        return { error: getSdkError("WC_METHOD_UNSUPPORTED") };
    }
  }

  public denomToCaip19AssetId(denom: string): Caip19AssetId | null {
    if (denom.startsWith("factory/")) {
      return `${this.chainId}/factory:${denom.replace("factory/", "").replace("/", "%2F")}`;
    }

    if (denom.startsWith("ibc/")) {
      return `${this.chainId}/ibc:${denom.replace("ibc/", "").replace("/", "%2F")}`;
    }

    if (this.validateAddress(denom)) {
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
        return reference.replace("%2F", "/");
      default:
        return null;
    }
  }
}
