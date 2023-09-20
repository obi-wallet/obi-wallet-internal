import { action, makeObservable, observable } from "mobx";

import { MultisigKey } from "./implementation";
import { MultisigKeySchema } from "./schema";
import { ChainId } from "../../chains";
import { Key, ObservableKey } from "../key";
import { AbstractMigratable } from "../migratable";
import invariant from "tiny-invariant";

export function createMultisigKey(
  setupDetails: {
    homeAccountAddress: string,
    evmSignerAddress: string;
    evmUserContractAddress: string;
    ownerIndex: number;
  } | undefined,
  chain: ChainId,
  migratable: AbstractMigratable<typeof MultisigKeySchema> = {
    keys: [],
    threshold: 1,
  },
  factories = {
    Key,
    createMultisigKey,
  },
): MultisigKey {
  const { keys, threshold } =
    MultisigKeySchema.migratableSchema.parse(migratable);
  let keysMapped: Key[];
  try {
    keysMapped = keys.map((key) => factories.Key.create(key));
  } catch(e) {
    keysMapped = [];
  }
  return new MultisigKey(
    setupDetails,
    chain,
    keysMapped,
    threshold,
    {
      Key: factories.Key,
      createMultisigKey: factories.createMultisigKey,
    },
  );
}

export function createObservableMultisigKey(
  setupDetails: {
    homeAccountAddress: string;
    evmSignerAddress: string;
    evmUserContractAddress: string;
    ownerIndex: number;
  } | undefined,
  chain: ChainId,
  migratable?: AbstractMigratable<typeof MultisigKeySchema>,
) {
  const key = createMultisigKey(setupDetails, chain, migratable, {
    Key: ObservableKey,
    createMultisigKey: createObservableMultisigKey,
  });
  makeObservable<MultisigKey, "_setupDetails" | "_chainId" | "_keys" | "_threshold" | "setKey">(
    key,
    {
      _setupDetails: observable,
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
