import { AbstractSdk } from "./abstract";
import { SecretJsClient } from "../../clients";
import { SecretJsHomeChainId } from "../../home-chains";
import { SecretJsTransactionsSdk } from "../transactions";

export class SecretJsSdk extends AbstractSdk {
  public transactions: SecretJsTransactionsSdk;

  protected constructor(protected override chainId: SecretJsHomeChainId) {
    super(chainId);
    const client = new SecretJsClient(chainId);
    this.transactions = new SecretJsTransactionsSdk({ chainId, client });
  }

  public static chainId(chainId: SecretJsHomeChainId) {
    return new SecretJsSdk(chainId);
  }
}
