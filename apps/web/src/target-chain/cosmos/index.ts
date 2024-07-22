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
import { CosmosTokenRegistry } from "@/target-chain/cosmos/token-registry";
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
  SigningStargateClient,
  StargateClient,
  StdFee,
} from "@cosmjs/stargate";
import { Encoding } from "@obi-wallet/encoding";
import { MpcWallet } from "@obi-wallet/sdk";
import {
  AbstractTargetChain,
  AssetId,
} from "@obi-wallet/sdk-abstract-target-chain";
import { parseCaip2ChainId } from "@obi-wallet/sdk-caip";
import { serialize } from "@obi-wallet/sdk-json";
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
import BigNumber from "bignumber.js";
import { chains } from "chain-registry";
import { pubkeyToAddress } from "secretjs";
import invariant from "tiny-invariant";
import { z } from "zod";

const EncodeObjectSchema = z.object({
  typeUrl: z.string(),
  value: z.unknown(),
});

function isEncodeObject(message: unknown): message is EncodeObject {
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
  protected readonly tokenRegistry: CosmosTokenRegistry;

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

  public computeAddress(publicKey: Secp256k1PublicKey) {
    return pubkeyToAddress(
      getSec256k1CompressedPublicKey(publicKey),
      this.chainData.prefix,
    );
  }

  protected async obiAccountAddressQueryFn(publicKey: Secp256k1PublicKey) {
    return this.computeAddress(publicKey);
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

  public async balancesQueryFn(address: string) {
    return await this.withStargateClient(async (client) => {
      const balances = await client.getAllBalances(address);
      return balances.map((balance) => {
        return {
          chainId: this.chainId,
          assetId: balance.denom,
          rawAmount: balance.amount,
        };
      });
    });
  }

  public async priceQueryFn(id: AssetId) {
    if (
      [CosmosChainId.Neutron, CosmosChainId.Sei].includes(this.chainId) &&
      !["untrn", "usei"].includes(id)
    ) {
      const url = "https://api.skip.money/v2/fungible/route";
      const asset = this.assetInfo(id);

      const amountIn = new BigNumber(1)
        .multipliedBy(10 ** (asset?.decimals ?? 0))
        .toFixed(0);

      const data = {
        source_asset_chain_id: this.cosmosChainId,
        amount_in: amountIn,
        source_asset_denom: id,
        dest_asset_denom:
          "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
        dest_asset_chain_id: this.cosmosChainId,
        allow_unsafe: true,
      };
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: serialize(data),
        });
        const json = await res.json();

        const number = Number(json.usd_amount_out);
        return { usdValue: number.toString(10) };
      } catch (e) {
        console.log("SKIP ERROR", e);
      }
    }

    const url = `https://api.0xsquid.com/v1/token-price?chainId=${this.cosmosChainId}&tokenAddress=${id}`;
    try {
      const response = await fetch(url);
      const schema = z.object({
        price: z.number(),
      });
      const data = await response.json();
      const { price } = schema.parse(data);
      return { usdValue: price.toString(10) };
    } catch (e) {
      console.error("Error fetching price", e);
      return { usdValue: "0" };
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

  public validateAddress(address: string): boolean {
    const { prefix } = bech32.decode(address);
    return prefix === this.chainData.prefix;
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
}
