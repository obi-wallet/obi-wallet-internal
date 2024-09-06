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
    keysMapped = keys.map((key) => {
      return factories.Key.create(key);
    });
  } catch {
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
  makeObservable<
    MultisigKey,
    "_chainId" | "_keys" | "_threshold" | "addKey" | "setKeys" | "setPrimaryKey"
  >(
    key,
    {
      _chainId: observable,
      _keys: observable,
      _threshold: observable,
      toJSON: false,
      clone: false,
      setThreshold: action,
      addKey: action,
      removeKey: action,
      removeKeyByPublicKey: action,
      setKeys: action,
      setPrimaryKey: action,
    },
    {
      name: "MultisigKey",
    },
  );
  return key;
}
