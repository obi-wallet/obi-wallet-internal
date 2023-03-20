import {
  Key,
  KeyAbstractSerializedMapping,
  KeySubclassTypeMapping,
  KeyType,
} from "./keys";
import { MultisigKeySchema } from "./schema";
import { Chain } from "../../chains";
import { MultisigPublicKey } from "../../keys";
import { AbstractSerialized } from "../migratable";

export interface MultisigKeyInterface {
  readonly schema: typeof MultisigKeySchema;
  readonly chain: Chain;
  readonly threshold: number;
  readonly publicKey: MultisigPublicKey;
  readonly address: string;
  readonly keys: Key[];
  readonly signerTypes: ReadonlyArray<string>;

  toJSON(): AbstractSerialized<typeof MultisigKeySchema>;
  equals(other: MultisigKeyInterface): boolean;
  clone(): MultisigKeyInterface;
  setThreshold(threshold: number): void;
  hasKeyOfType(type: KeyType): boolean;
  getKeyOfType<T extends KeyType>(
    type: T
  ): KeySubclassTypeMapping[T] | undefined;
  getUsableKeyOfType<T extends KeyType>(
    type: T
  ): KeySubclassTypeMapping[T] | undefined;
  setKey<T extends KeyType>(key: KeyAbstractSerializedMapping[T]): void;
  removeKeyOfType<T extends KeyType>(type: T): void;
}
