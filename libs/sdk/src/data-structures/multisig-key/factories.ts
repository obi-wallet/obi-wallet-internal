import { action, makeObservable, observable } from "mobx";

import { MultisigKey } from "./implementation";
import { MultisigKeySchema } from "./schema";
import { Chain } from "../../chains";
import { Key, ObservableKey } from "../key";
import { AbstractMigratable } from "../migratable";

export function createMultisigKey(
  chain: Chain,
  migratable: AbstractMigratable<typeof MultisigKeySchema> = {
    keys: [],
    threshold: 1,
  },
  factories = {
    Key,
    createMultisigKey,
  }
) {
  const { keys, threshold } =
    MultisigKeySchema.migratableSchema.parse(migratable);
  return new MultisigKey(
    chain,
    keys.map((key) => factories.Key.create(key)),
    threshold,
    {
      Key: factories.Key,
      createMultisigKey: factories.createMultisigKey,
    }
  );
}

export function createObservableMultisigKey(
  chain: Chain,
  migratable?: AbstractMigratable<typeof MultisigKeySchema>
) {
  const key = createMultisigKey(chain, migratable, {
    Key: ObservableKey,
    createMultisigKey: createObservableMultisigKey,
  });
  makeObservable<MultisigKey, "_chainId" | "_keys" | "_threshold">(
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
    }
  );
  return key;
}
