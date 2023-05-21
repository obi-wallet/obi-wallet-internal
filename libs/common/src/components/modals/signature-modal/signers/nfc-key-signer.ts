import {
  AsyncKeySigner,
  KeySubclassTypeMapping,
  KeyType,
} from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

export class NfcKeySigner extends AsyncKeySigner<KeyType.Nfc> {
  protected demoMode: boolean;

  public constructor({
    key,
    demoMode,
  }: {
    key: KeySubclassTypeMapping[KeyType.Nfc];
    demoMode: boolean;
  }) {
    super(key);
    this.demoMode = demoMode;
  }

  public async signHash(hash: Uint8Array) {
    invariant(false, "NfcKeySigner.signHash not implemented for web");
    return await super.signHash(hash);
  }
}
