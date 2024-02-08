import {
  CosmosSdkChainData,
  CosmosSdkChainId,
  CosmosSdkChains,
} from "@/target-chain/cosmos-sdk/chains";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import {
  getSec256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { pubkeyToAddress } from "secretjs";

export class CosmosSdkTargetChain extends AbstractTargetChain {
  protected readonly chainData: CosmosSdkChainData;

  public constructor(chainId: CosmosSdkChainId) {
    super();
    this.chainData = CosmosSdkChains[chainId];
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
    // TODO: handle multiple
    const rpc = this.chainData.rpc;
    const rpcs = [rpc];
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
    // TODO: handle multiple
    const rpc = this.chainData.rpc;
    const rpcs = [rpc];
    for (const rpc of rpcs) {
      try {
        return await SigningStargateClient.connectWithSigner(rpc, signer, {
          // TODO: handle gas price
          // gasPrice: {
          //   // low: 10, average: 25, high: 40
          //   amount: Decimal.fromAtomics("25", 4),
          //   denom,
          // },
        });
      } catch (e) {
        console.error(e);
      }
    }
    throw new Error("No RPC connected");
  }
}
