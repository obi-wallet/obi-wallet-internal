import { isObservable, isObservableProp } from "mobx";

import {
  KeyType,
  MultisigKey,
  ObservableMultisigKey,
  Serialized,
} from "../../src";

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
  };

  test(".empty observable", () => {
    expect(isObservable(ObservableMultisigKey.create(chain))).toEqual(true);
  });

  test(".deserialize observable", () => {
    expect(isObservable(ObservableMultisigKey.create(chain, fixture))).toEqual(
      true
    );
  });

  test("chain observable", () => {
    const key = ObservableMultisigKey.create(chain);
    expect(isObservableProp(key, "_chain")).toEqual(true);
  });

  test("keys observable", () => {
    const key = ObservableMultisigKey.create(chain, fixture);
    expect(isObservable(key.keys)).toEqual(true);
    expect(isObservable(key.keys[0])).toEqual(true);
    key.setKey<KeyType.Cloud>({
      type: KeyType.Cloud,
      payload: {
        provider: "google-drive",
        publicKey: {
          type: "tendermint/PubKeySecp256k1",
          value: "foo",
        },
        privateKey: "bar",
      },
    });
    expect(isObservable(key.keys[0])).toEqual(true);
    key.removeKeyOfType(KeyType.Cloud);
    expect(isObservable(key.keys)).toEqual(true);
  });

  test("threshold observable", () => {
    const key = ObservableMultisigKey.create(chain);
    expect(isObservableProp(key, "_threshold")).toEqual(true);
  });
});
