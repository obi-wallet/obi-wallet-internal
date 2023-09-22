import { isObservable, isObservableProp } from "mobx";

import {
  KeyType,
  MultisigKey,
  ObservableMultisigKey,
  Serialized,
} from "../../src";
import { expectIsPureObject } from "../__helpers__";

describe("ObservableMultisigKey", () => {
  const chain = "phoenix-1";
  const fixture: Serialized<typeof MultisigKey> = {
    keys: [
      {
        payload: {
          type: KeyType.Cloud,
          publicKey: {
            type: "tendermint/PubKeySecp256k1",
            value: "foo",
          },
        },
      },
    ],
    threshold: 1,
    evmSigningAddress: "",
    evmUserContractAddress: "",
  };

  test(".empty observable", () => {
    expect(
      isObservable(ObservableMultisigKey.create(undefined, chain)),
    ).toEqual(true);
  });

  test(".deserialize observable", () => {
    expect(
      isObservable(ObservableMultisigKey.create(undefined, chain, fixture)),
    ).toEqual(true);
  });

  test(".toJSON pure", () => {
    expectIsPureObject(
      ObservableMultisigKey.create(undefined, chain, fixture).toJSON(),
    );
  });

  test("chain observable", () => {
    const key = ObservableMultisigKey.create(undefined, chain);
    expect(isObservableProp(key, "_chainId")).toEqual(true);
  });

  test("keys observable", () => {
    const key = ObservableMultisigKey.create(undefined, chain, fixture);
    expect(isObservable(key.keys)).toEqual(true);
    expect(isObservable(key.keys[0])).toEqual(true);
    key.setCloudKey({
      provider: "google-drive",
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: "foo",
      },
      privateKey: "bar",
    });
    expect(isObservable(key.keys[0])).toEqual(true);
    key.removeKeyOfType(KeyType.Cloud);
    expect(isObservable(key.keys)).toEqual(true);
  });

  test("threshold observable", () => {
    const key = ObservableMultisigKey.create(undefined, chain);
    expect(isObservableProp(key, "_threshold")).toEqual(true);
  });
});
