import {
  CosmosSdkChainData,
  CosmosSdkChainId,
  CosmosSdkChains,
} from "@/target-chain/cosmos-sdk/chains";
import { StargateClient } from "@cosmjs/stargate";
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
}
