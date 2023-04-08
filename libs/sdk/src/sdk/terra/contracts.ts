import { TerraClient } from "./client";
import { TerraChain } from "../../chains";
import { AbstractContractsSdk } from "../abstract";

export class TerraContractsSdk extends AbstractContractsSdk {
  protected client: TerraClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: TerraChain;
    client: TerraClient;
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
