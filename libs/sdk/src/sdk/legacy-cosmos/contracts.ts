import { LegacyCosmosClient } from "./client";
import { LegacyCosmosChainId } from "../../chains";
import { AbstractContractsSdk } from "../abstract";

export class LegacyCosmosContractsSdk extends AbstractContractsSdk {
  protected client: LegacyCosmosClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: LegacyCosmosChainId;
    client: LegacyCosmosClient;
  }) {
    super(chainId);
    this.client = client;
  }

  protected async codeIdQueryFn(contract: string): Promise<number> {
    return await this.client.withCosmWasmClient(async (client) => {
      const { codeId } = await client.getContract(contract);
      return codeId;
    });
  }
}
