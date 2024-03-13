import { action, makeObservable, observable } from "mobx";

import { MultisigKey } from "./implementation";
import { MultisigKeySchema } from "./schema";
import { ChainId } from "../../chains";
import { Key, ObservableKey } from "../key";
import { AbstractMigratable } from "../migratable";

export function createMultisigKey(
  chain: ChainId,
  serialized: AbstractMigratable<typeof MultisigKeySchema> = {
    keys: [],
    threshold: 1,
  },
  factories = {
    Key,
    createMultisigKey,
  },
): MultisigKey {
  const { keys, primaryKeyIndex, threshold } =
    MultisigKeySchema.migratableSchema.parse(serialized);
  let keysMapped: Key[];
  try {
    keysMapped = keys.map((key) => factories.Key.create(key));
  } catch (e) {
    keysMapped = [];
  }
  return new MultisigKey(chain, keysMapped, primaryKeyIndex, threshold, {
    Key: factories.Key,
    createMultisigKey: factories.createMultisigKey,
  });
}

export function createObservableMultisigKey(
  chain: ChainId,
  migratable?: AbstractMigratable<typeof MultisigKeySchema>,
) {
  const key = createMultisigKey(chain, migratable, {
    Key: ObservableKey,
    createMultisigKey: createObservableMultisigKey,
  });
  makeObservable<MultisigKey, "_chainId" | "_keys" | "_threshold" | "setKey">(
    key,
    {
      _chainId: observable,
      _keys: observable,
      _threshold: observable,
      toJSON: false,
      clone: false,
      setThreshold: action,
      setKey: action,
      removeKeyOfType: action,
    },
    {
      name: "MultisigKey",
    },
  );
  return key;
}
