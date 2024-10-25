import { pubkeyToAddress } from "@cosmjs/amino";

import { SecretJsClient } from "../../../clients";
import { SecretJsHomeChainId, SecretJsHomeChains } from "../../../home-chains";
import { PublicKey } from "../../../keys";
import { AbstractTransactionsSdk } from "../abstract";

export class SecretJsTransactionsSdk extends AbstractTransactionsSdk {
  protected override chainId: SecretJsHomeChainId;
  protected client: SecretJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: SecretJsHomeChainId;
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
    return SecretJsHomeChains[this.chainId];
  }
}
