import invariant from "tiny-invariant";

import { AbstractContractsSdk } from "./abstract";
import { SecretJsClient } from "../../clients";
import { SecretJsHomeChainId } from "../../home-chains";

export class SecretJsContractsSdk extends AbstractContractsSdk {
  protected client: SecretJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: SecretJsHomeChainId;
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
      const codeId = response.contract_info?.code_id;
      invariant(codeId, "Expected code_id in response.");
      return parseInt(codeId, 10);
    });
  }
}
