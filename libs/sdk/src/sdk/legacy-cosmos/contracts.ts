import { LegacyCosmosChainId } from "../../chains";
import { CosmJsClient } from "../../clients";
import { AbstractContractsSdk } from "../abstract";

export class LegacyCosmosContractsSdk extends AbstractContractsSdk {
  protected client: CosmJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: LegacyCosmosChainId;
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
