import { isObservable, isObservableProp } from "mobx";

import {
  GatekeeperConfig,
  MultisigKey,
  ObservableMultisigWallet,
  Serialized,
} from "../../src";

describe("ObservableMultisigWallet", () => {
  const fixture: Serialized<typeof ObservableMultisigWallet> = {
    type: "multisig",
    data: {
      chain: "phoenix-1",
      gatekeeperConfig: GatekeeperConfig.empty().toJSON(),
      owner: MultisigKey.empty("phoenix-1").toJSON(),
      proxyAddress: {
        v: 1,
        address: "cosmos1",
      },
      singlesigWallets: [],
      currentAccount: null,
    },
  };

  let key: ObservableMultisigWallet;
  beforeEach(() => {
    key = ObservableMultisigWallet.deserialize(fixture);
  });

  test(".deserialize observable", () => {
    expect(isObservable(key)).toEqual(true);
  });

  test("chainId observable", () => {
    expect(isObservableProp(key, "_chainId")).toEqual(true);
  });

  test("owner observable", () => {
    expect(isObservable(key.owner)).toEqual(true);
  });

  test("proxyAddress observable", () => {
    expect(isObservableProp(key, "_proxyAddress")).toEqual(true);
  });

  test("gatekeeperConfig observable", () => {
    expect(isObservable(key.gatekeeperConfig)).toEqual(true);
  });

  test("singlesigWallets observable", () => {
    expect(isObservable(key.singlesigWallets)).toEqual(true);
    key.upsertSinglesigWallet({
      type: "singlesig-wallet",
      privateKey: "foo",
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: "bar",
      },
    });
    expect(isObservable(key.singlesigWallets[0])).toEqual(true);
    key.removeSinglesigWallet(key.singlesigWallets[0]);
    expect(isObservable(key.singlesigWallets)).toEqual(true);
  });

  test("currentAccount observable", () => {
    expect(isObservableProp(key, "_currentAccount")).toEqual(true);
  });
});
