import {
  CosmosSdkChainData,
  CosmosSdkChainId,
  CosmosSdkChains,
} from "@/target-chain/cosmos-sdk/chains";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { CosmosSdkTokenRegistry } from "@/target-chain/cosmos-sdk/token-registry";
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
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import {
  getSec256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { bech32 } from "bech32";
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

export class CosmosSdkTargetChain extends AbstractTargetChain {
  protected readonly chainData: CosmosSdkChainData;
  protected readonly chain: Chain;
  protected readonly tokenRegistry: CosmosSdkTokenRegistry;

  public constructor(chainId: CosmosSdkChainId) {
    super();
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

  public computeAddress(publicKey: Secp256k1PublicKey) {
    return pubkeyToAddress(
      getSec256k1CompressedPublicKey(publicKey),
      this.chainData.prefix,
    );
  }

  public async withStargateClient<T>(f: (client: StargateClient) => T) {
    const client = await this.createStargateClient();
    try {
      return await f(client);
    } finally {
      client.disconnect();
    }
  }

  public async withSigningStargateClient<T>(
    signer: OfflineSigner,
    f: (client: SigningStargateClient) => T,
  ) {
    const client = await this.createSigningStargateClient(signer);
    try {
      return await f(client);
    } finally {
      client.disconnect();
    }
  }

  public async withCosmWasmClient<T>(f: (client: CosmWasmClient) => T) {
    const client = await this.createCosmWasmClient();
    try {
      return await f(client);
    } finally {
      client.disconnect();
    }
  }

  public async withSigningCosmWasmClient<T>(
    signer: OfflineSigner,
    f: (client: SigningCosmWasmClient) => T,
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
  }: {
    wallet: MpcWallet;
    messages: unknown[];
  }) {
    invariant(this.validateMessages(messages), "Invalid messages");

    const signer = await this.getSigner(wallet);
    return await this.withSigningCosmWasmClient(signer, async (client) => {
      if (!this.gasPrice) return undefined;

      const gasEstimation = await client.simulate(
        signer.address,
        messages,
        undefined,
      );
      return calculateFee(Math.round(gasEstimation * 1.3), this.gasPrice);
    });
  }

  public async signAndBroadcast({
    wallet,
    fee,
    messages,
  }: {
    wallet: MpcWallet;
    fee: StdFee;
    messages: unknown[];
  }) {
    invariant(this.validateMessages(messages), "Invalid messages");

    const signer = await this.getSigner(wallet);
    return await this.withSigningStargateClient(signer, async (client) => {
      return await client.signAndBroadcast(signer.address, messages, fee);
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

  public getAsset(denom: string) {
    return this.tokenRegistry.getAsset({
      chainId: this.chainData.id,
      denom,
    });
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
