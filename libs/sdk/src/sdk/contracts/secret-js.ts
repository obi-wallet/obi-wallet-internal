import invariant from "tiny-invariant";

import { AbstractContractsSdk } from "./abstract";
import { SecretJsChainId } from "../../chains";
import { SecretJsClient } from "../../clients";

export class SecretJsContractsSdk extends AbstractContractsSdk {
  protected client: SecretJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: SecretJsChainId;
    client: SecretJsClient;
  }) {
    super(chainId);
    this.client = client;
  }

  protected async codeIdQueryFn(contract: string): Promise<number> {
    return await this.client.withSecretNetworkClient(async (client) => {
      const response = await client.query.compute.contractInfo({
        contract_address: contract,
      });
      const codeId = response.ContractInfo?.code_id;
      invariant(codeId, "Expected code_id in response.");
      return parseInt(codeId, 10);
    });
  }
}
