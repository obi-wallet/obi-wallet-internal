import { action, makeObservable, observable } from "mobx";

import { MultisigKey } from "./implementation";
import { MultisigKeyInterface } from "./interface";
import { createKey, createObservableKey } from "./keys";
import { MultisigKeySchema } from "./schema";
import { Chain } from "../../chains";
import { AbstractMigratable } from "../migratable";

export function createMultisigKey(
  chain: Chain,
  serialized: AbstractMigratable<typeof MultisigKeySchema> = {
    keys: [],
    threshold: 1,
  },
  factories = {
    createKey,
    createMultisigKey,
  }
): MultisigKeyInterface {
  const { keys, threshold } =
    MultisigKeySchema.migratableSchema.parse(serialized);
  return new MultisigKey(
    chain,
    keys.map((key) => factories.createKey(key)),
    threshold,
    factories
  );
}

export function createObservableMultisigKey(
  chain: Chain,
  serialized?: AbstractMigratable<typeof MultisigKeySchema>
): MultisigKeyInterface {
  const key = createMultisigKey(chain, serialized, {
    createKey: createObservableKey,
    createMultisigKey: createObservableMultisigKey,
  });
  makeObservable<MultisigKeyInterface, "_chain" | "_keys" | "_threshold">(
    key,
    {
      _chain: observable,
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
    }
  );
  return key;
}
