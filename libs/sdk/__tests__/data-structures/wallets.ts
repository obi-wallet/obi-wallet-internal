import { isObservable, isObservableProp } from "mobx";

import { ObservableWallets, Wallets } from "../../src";
import { expectIsPureObject } from "../__helpers__";

describe("ObservableWallets", () => {
  let wallets: Wallets;
  beforeEach(() => {
    wallets = ObservableWallets.create();
  });

  test(".empty observable", () => {
    expect(isObservable(wallets)).toEqual(true);
  });

  test(".deserialize observable", () => {
    expect(
      isObservable(
        ObservableWallets.create({
          wallets: [],
          currentWalletIndex: null,
        })
      )
    ).toEqual(true);
  });

  test(".toJSON pure", () => {
    expectIsPureObject(wallets.toJSON());
  });

  test("wallets observable", () => {
    expect(isObservable(wallets.wallets)).toEqual(true);
  });

  test("currentWalletIndex observable", () => {
    expect(isObservableProp(wallets, "_currentWalletIndex")).toEqual(true);
  });
});
