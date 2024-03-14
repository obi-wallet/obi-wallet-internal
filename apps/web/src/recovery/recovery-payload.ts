import { Draftable } from "@/stores/drafts/draft";
import {
  HomeChainId,
  KeyType,
  MultisigKey,
  ObservableMultisigKey,
} from "@obi-wallet/sdk";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { action, observable } from "mobx";

export class RecoveryPayload implements Draftable {
  @observable protected accessor _multisigKey: MultisigKey;

  constructor(chainId: HomeChainId) {
    this._multisigKey = ObservableMultisigKey.create(chainId);
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

  @action
  public async setPrimaryKey({
    key,
  }: {
    key: {
      type: KeyType.Passkey;
      payload: Secp256k1KeyPair;
    };
  }) {
    const newKey = (() => {
      switch (key.type) {
        case KeyType.Passkey:
          return this._multisigKey.addPasskeyKey(key.payload);
        default:
          throw new Error(`Unsupported primary key type: ${key.type}`);
      }
    })();
    this._multisigKey.setPrimaryKey(newKey);
  }
}
