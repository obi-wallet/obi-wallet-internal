import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/feather.js";

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
    switch (publicKey.type) {
      case "tendermint/PubKeySecp256k1":
        return SimplePublicKey.fromAmino(publicKey).address(this.chain.prefix);
      case "tendermint/PubKeyMultisigThreshold":
        return LegacyAminoMultisigPublicKey.fromAmino(publicKey).address(
          this.chain.prefix,
        );
      default:
        throw new Error("Unsupported public key type");
    }
  }

  protected get chain() {
    return SecretJsChains[this.chainId];
  }
}
