import { isObservable } from "mobx";

import { ObservableGatekeeperConfig } from "../../src";

describe("ObservableGatekeeperConfig", () => {
  test(".empty observable", () => {
    expect(isObservable(ObservableGatekeeperConfig.empty())).toEqual(true);
  });

  test(".deserialize observable", () => {
    expect(
      isObservable(
        ObservableGatekeeperConfig.deserialize({
          beneficiaries: [],
          flexAccounts: [],
        })
      )
    ).toEqual(true);
  });

  test("beneficiaries observable", () => {
    const config = ObservableGatekeeperConfig.empty();
    expect(isObservable(config.beneficiaries)).toEqual(true);
    config.upsertBeneficiary({
      type: "beneficiary",
      address: "address",
      meta: {
        name: "name",
        icon: "icon",
      },
      dripSchedule: {
        rate: 0.05,
        period: {
          years: 1,
        },
      },
      dormancyThreshold: {
        years: 1,
      },
    });
    expect(isObservable(config.beneficiaries)).toEqual(true);
    config.removeBeneficiaryByAddress({ address: "address" });
    expect(isObservable(config.beneficiaries)).toEqual(true);
  });

  test("flexAccounts observable", () => {
    const config = ObservableGatekeeperConfig.empty();
    expect(isObservable(config.beneficiaries)).toEqual(true);
    config.upsertFlexAccount({
      type: "flex-account",
      address: "address",
      meta: {
        name: "name",
        icon: "icon",
      },
      autoSign: null,
      privateKey: "privateKey",
      spendLimit: null,
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: "value",
      },
    });
    expect(isObservable(config.beneficiaries)).toEqual(true);
    config.removeFlexAccountByAddress({ address: "address" });
    expect(isObservable(config.beneficiaries)).toEqual(true);
  });
});
