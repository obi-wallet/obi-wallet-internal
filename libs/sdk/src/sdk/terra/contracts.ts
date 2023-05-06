import { TerraChainId } from "../../chains";
import { FeatherJsClient } from "../../clients";
import { AbstractContractsSdk } from "../abstract";

export class TerraContractsSdk extends AbstractContractsSdk {
  protected client: FeatherJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: TerraChainId;
    client: FeatherJsClient;
  }) {
    super(chainId);
    this.client = client;
  }

  protected async codeIdQueryFn(contract: string): Promise<number> {
    return await this.client.withClient(async (client) => {
      const { code_id } = await client.wasm.contractInfo(contract);
      return code_id;
    });
  }
}
