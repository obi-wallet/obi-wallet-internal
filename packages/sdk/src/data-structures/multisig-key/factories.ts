import { action, makeObservable, observable } from "mobx";
import { z } from "zod";

import { MultisigKey } from "./implementation";
import { MultisigKeySchema } from "./schema";
import { ChainId } from "../../chains";
import { LegacyKey, LegacyObservableKey } from "../key";

export function createMultisigKey(
  chain: ChainId,
  serialized: z.infer<typeof MultisigKeySchema> = {
    keys: [],
    threshold: 1,
    primaryKeyIndex: null,
  },
  factories = {
    Key: LegacyKey,
    createMultisigKey,
  },
): MultisigKey {
  const { keys, primaryKeyIndex, threshold } = serialized;
  return new MultisigKey(chain, keys, primaryKeyIndex, threshold, {
    createMultisigKey: factories.createMultisigKey,
  });
}

export function createObservableMultisigKey(
  chain: ChainId,
  serialized?: z.infer<typeof MultisigKeySchema>,
) {
  const key = createMultisigKey(chain, serialized, {
    Key: LegacyObservableKey,
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
