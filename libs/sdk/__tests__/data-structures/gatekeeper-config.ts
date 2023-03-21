import { isObservable } from "mobx";

import {
  createObservableGatekeeperConfig,
  ObservableBeneficiary,
  ObservableFlexAccount,
} from "../../src";
import { expectIsPureObject } from "../__helpers__";

describe("ObservableGatekeeperConfig", () => {
  test(".empty observable", () => {
    expect(isObservable(createObservableGatekeeperConfig())).toEqual(true);
  });

  test(".deserialize observable", () => {
    expect(
      isObservable(
        createObservableGatekeeperConfig({
          beneficiaries: [],
          flexAccounts: [],
        })
      )
    ).toEqual(true);
  });

  test(".toJSON pure", () => {
    expectIsPureObject(createObservableGatekeeperConfig().toJSON());
  });

  test("beneficiaries observable", () => {
    const config = createObservableGatekeeperConfig();
    expect(isObservable(config.beneficiaries)).toEqual(true);
    config.upsertBeneficiary(
      ObservableBeneficiary.create({
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
      })
    );
    expect(isObservable(config.beneficiaries)).toEqual(true);
    config.removeBeneficiaryByAddress({ address: "address" });
    expect(isObservable(config.beneficiaries)).toEqual(true);
  });

  test("flexAccounts observable", () => {
    const config = createObservableGatekeeperConfig();
    expect(isObservable(config.beneficiaries)).toEqual(true);
    config.upsertFlexAccount(
      ObservableFlexAccount.create({
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
      })
    );
    expect(isObservable(config.beneficiaries)).toEqual(true);
    config.removeFlexAccountByAddress({ address: "address" });
    expect(isObservable(config.beneficiaries)).toEqual(true);
  });
});
