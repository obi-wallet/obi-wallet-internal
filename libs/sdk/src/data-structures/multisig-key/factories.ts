import { action, makeObservable, observable } from "mobx";

import { MultisigKey } from "./implementation";
import { MultisigKeySchema } from "./schema";
import { ChainId } from "../../chains";
import { Key, ObservableKey } from "../key";
import { AbstractMigratable } from "../migratable";

export type SetupMultisigKeyDetails = {
  homeAccountAddress: string;
  signingPublicKey: string;
  evmSigningAddress: string;
  evmUserContractAddress: string;
  ownerIndex: number;
};

export function createMultisigKey(
  setupDetails: SetupMultisigKeyDetails | undefined, // TODO: make it optional
  chain: ChainId,
  serialized: AbstractMigratable<typeof MultisigKeySchema> = {
    keys: [],
    threshold: 1,
    signingPublicKey: "",
    evmSigningAddress: "",
    evmUserContractAddress: "",
  },
  factories = {
    Key,
    createMultisigKey,
  },
): MultisigKey {
  const { keys, threshold } =
    MultisigKeySchema.migratableSchema.parse(serialized);
  let keysMapped: Key[];
  try {
    keysMapped = keys.map((key) => factories.Key.create(key));
  } catch (e) {
    keysMapped = [];
  }
  return new MultisigKey(setupDetails, chain, keysMapped, threshold, {
    Key: factories.Key,
    createMultisigKey: factories.createMultisigKey,
  });
}

export function createObservableMultisigKey(
  setupDetails: SetupMultisigKeyDetails | undefined,
  chain: ChainId,
  migratable?: AbstractMigratable<typeof MultisigKeySchema>,
) {
  console.log("running createObservableMultisigKey()");
  const key = createMultisigKey(setupDetails, chain, migratable, {
    Key: ObservableKey,
    createMultisigKey: createObservableMultisigKey,
  });
  makeObservable<
    MultisigKey,
    "_setupDetails" | "_chainId" | "_keys" | "_threshold" | "setKey"
  >(
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
