import { ProxyWallet } from "@/recovery/use-recover";
import { Draftable } from "@/stores/drafts/draft";
import {
  ChainId,
  KeyType,
  MultisigKey,
  ObservableMultisigKey,
} from "@obi-wallet/sdk";
import {
  Secp256k1KeyPair,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { observable } from "mobx";
import { z } from "zod";

export class RecoveryPayload implements Draftable {
  @observable protected accessor _multisigKey: MultisigKey;

  constructor(chainId: ChainId) {
    this._multisigKey = ObservableMultisigKey.create(undefined, chainId);
  }

  public get chainId() {
    return this._multisigKey.chainId;
  }

  public get multisigKey() {
    return this._multisigKey;
  }

  public clone() {
    const clone = new RecoveryPayload(this._multisigKey.chainId);
    clone._multisigKey = this._multisigKey.clone();
    return clone as this;
  }

  public equals(other: RecoveryPayload) {
    return this._multisigKey.equals(other._multisigKey);
  }

  public async setPrimaryKey({
    key,
  }: {
    // TODO: here we also need to allow other key types
    key: {
      type: KeyType.Passkey;
      payload: Secp256k1KeyPair;
    };
  }) {
    switch (key.type) {
      case KeyType.Passkey:
        await this._multisigKey.setPasskeyKey(key.payload);
        break;
      default:
        throw new Error(`Unsupported primary key type: ${key.type}`);
    }
  }

  public async lookupProxyWallets(publicKey: Secp256k1PublicKey) {
    const response = await fetch(
      "https://proxy-wallets.obiwallet.workers.dev",
      {
        method: "POST",
        body: JSON.stringify({
          chainId: this.chainId,
          publicKey: publicKey.value,
        }),
      },
    );
    if (response.status === 404) {
      console.log("No wallets found");
      return [];
    }

    const schema = z.array(ProxyWallet);
    const result = schema.safeParse(await response.json());
    if (!result.success) {
      throw new Error(`Failed to parse proxy wallets: ${result.error}`);
    }
    return result.data;
  }
}
