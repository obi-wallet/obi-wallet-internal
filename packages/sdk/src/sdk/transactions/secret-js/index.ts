import { pubkeyToAddress } from "@cosmjs/amino";

import { SecretJsChainId, SecretJsChains } from "../../../chains";
import { SecretJsClient } from "../../../clients";
import { PublicKey } from "../../../keys";
import { AbstractTransactionsSdk } from "../abstract";

export class SecretJsTransactionsSdk extends AbstractTransactionsSdk {
  protected override chainId: SecretJsChainId;
  protected client: SecretJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: SecretJsChainId;
    client: SecretJsClient;
  }) {
    super(chainId);
    this.chainId = chainId;
    this.client = client;
  }

  public getAddressOfPublicKey(publicKey: PublicKey) {
    return pubkeyToAddress(publicKey, this.chain.prefix);
  }

  protected get chain() {
    return SecretJsChains[this.chainId];
  }
}
