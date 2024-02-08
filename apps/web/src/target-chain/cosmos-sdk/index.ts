import {
  CosmosSdkChainData,
  CosmosSdkChainId,
  CosmosSdkChains,
} from "@/target-chain/cosmos-sdk/chains";
import { Chain } from "@chain-registry/types";
import { OfflineSigner } from "@cosmjs/proto-signing";
import {
  GasPrice,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import {
  getSec256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { chains } from "chain-registry";
import { pubkeyToAddress } from "secretjs";
import invariant from "tiny-invariant";

export class CosmosSdkTargetChain extends AbstractTargetChain {
  protected readonly chainData: CosmosSdkChainData;
  protected readonly chain: Chain;

  public constructor(chainId: CosmosSdkChainId) {
    super();
    this.chainData = CosmosSdkChains[chainId];
    const chain = chains.find((c) => {
      return c.chain_id === chainId;
    });
    invariant(chain, `Chain not found for ${chainId}`);
    this.chain = chain;
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
    const client = await this.createCosmJsStargateClient();
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
    const client = await this.createCosmJsSigningStargateClient(signer);
    try {
      return await f(client);
    } finally {
      client.disconnect();
    }
  }

  protected async createCosmJsStargateClient() {
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

  protected async createCosmJsSigningStargateClient(signer: OfflineSigner) {
    const rpcs = this.chainData.rpcs;
    const firstFeeToken = this.chain.fees?.fee_tokens[0];
    const gasPrice: GasPrice | undefined = firstFeeToken
      ? GasPrice.fromString(
          `${firstFeeToken.average_gas_price}u${firstFeeToken.denom}`,
        )
      : undefined;

    for (const rpc of rpcs) {
      try {
        return await SigningStargateClient.connectWithSigner(rpc, signer, {
          gasPrice,
        });
      } catch (e) {
        console.error(e);
      }
    }
    throw new Error("No RPC connected");
  }
}
