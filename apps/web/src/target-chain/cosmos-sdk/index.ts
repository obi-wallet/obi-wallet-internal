import { IntentionsPayload } from "@/keys/intentions-handler";
import {
  CosmosSdkChainData,
  CosmosSdkChainId,
  CosmosSdkChains,
} from "@/target-chain/cosmos-sdk/chains";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { CosmosSdkTokenRegistry } from "@/target-chain/cosmos-sdk/token-registry";
import { IntentionsResults } from "@/user-interactions/approve-intentions";
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
import { MpcWallet } from "@obi-wallet/sdk";
import {
  AbstractTargetChain,
  AssetId,
} from "@obi-wallet/sdk-abstract-target-chain";
import {
  getSec256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
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

export class CosmosSdkTargetChain extends AbstractTargetChain<CosmosSdkChainId> {
  protected readonly chainData: CosmosSdkChainData;
  protected readonly chain: Chain;
  protected readonly tokenRegistry: CosmosSdkTokenRegistry;

  public constructor(chainId: CosmosSdkChainId) {
    super(chainId);
    this.chainData = CosmosSdkChains[chainId];
    const chain = chains.find((c) => {
      return c.chain_id === chainId;
    });
    invariant(chain, `Chain not found for ${chainId}`);
    this.chain = chain;
    this.tokenRegistry = CosmosSdkTokenRegistry.getInstance();
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
    if (this.chainId === CosmosSdkChainId.Neutron && id !== "untrn") {
      const url = "https://api.skip.money/v2/fungible/route";
      const asset = this.assetInfo(id);

      const amountIn = new BigNumber(1)
        .multipliedBy(10 ** (asset?.decimals ?? 0))
        .toFixed(0);

      const data = {
        source_asset_chain_id: "neutron-1",
        amount_in: amountIn,
        source_asset_denom: id,
        dest_asset_denom:
          "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
        dest_asset_chain_id: this.chainId,
        allow_unsafe: true,
      };
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        const number = Number(json.usd_amount_out);
        return { usdValue: number.toString(10) };
      } catch (e) {
        console.log("SKIP ERROR", e);
      }
    }

    const url = `https://api.0xsquid.com/v1/token-price?chainId=${this.chainId}&tokenAddress=${id}`;
    const response = await fetch(url);

    try {
      const schema = z.object({
        price: z.number(),
      });
      const { price } = schema.parse(await response.json());
      return { usdValue: price.toString(10) };
    } catch (e) {
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
  }): Promise<Uint8Array | undefined> {
    invariant(this.validateMessages(messages), "Invalid messages");
    const signer = await this.getSigner(wallet);
    return await this.withSigningStargateClient(signer, async (client) => {
      try {
        // This will fail, but we are able to retrieve the hash that needs to be signed
        await client.sign(signer.address, messages, fee, memo);
      } catch (e) {
        // Ignoring errors
      }
      return signer.lastHash;
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
    signer.addIntentionsResults({
      payload: intentionsPayload,
      results: intentionsResults,
    });
    return await this.withSigningStargateClient(signer, async (client) => {
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
    signer.addIntentionsResults({
      payload: intentionsPayload,
      results: intentionsResults,
    });
    return await this.withSigningStargateClient(signer, async (client) => {
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
    return await CosmosSdkMpcSigner.fromWallet(wallet, this.chainData.id);
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
}
