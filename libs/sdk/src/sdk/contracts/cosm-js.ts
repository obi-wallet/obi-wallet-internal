import { AbstractContractsSdk } from "./abstract";
import { CosmosChainId, LegacyCosmosChainId } from "../../chains";
import { CosmJsClient } from "../../clients";

export class CosmJsContractsSdk extends AbstractContractsSdk {
  protected client: CosmJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: CosmosChainId | LegacyCosmosChainId;
    client: CosmJsClient;
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
