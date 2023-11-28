import { AsyncKeySigner } from "./abstract";
import { KeySubclassTypeMapping, KeyType } from "../data-structures";

export class AbstractLedgerSigner extends AsyncKeySigner<KeyType.Ledger> {
  public constructor({ key }: { key: KeySubclassTypeMapping[KeyType.Ledger] }) {
    super(key);
  }

  public async signHash(hash: Uint8Array) {}
}
