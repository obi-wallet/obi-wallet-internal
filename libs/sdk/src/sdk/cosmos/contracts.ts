import { CosmosClient } from "./client";
import { CosmosChain } from "../../chains";
import { AbstractContractsSdk } from "../abstract";

export class CosmosContractsSdk extends AbstractContractsSdk {
  protected client: CosmosClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: CosmosChain;
    client: CosmosClient;
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
