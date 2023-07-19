import { DateTime } from "luxon";
import { isAction, isObservable, isObservableProp } from "mobx";

import { FlexAccount, ObservableFlexAccount, Serialized } from "../../src";
import { expectIsPureObject } from "../__helpers__";

function createTest<
  A extends (factory: typeof FlexAccount) => FlexAccount[] | void,
>(name: string, fn: A) {
  return describe(name, () => {
    test.each([
      {
        name: "FlexAccount",
        FlexAccount: FlexAccount,
      },
      {
        name: "ObservableFlexAccount",
        FlexAccount: ObservableFlexAccount,
        postFn: expectIsObservable,
      },
    ])(`$name`, ({ FlexAccount, postFn }) => {
      const result = fn(FlexAccount);
      if (typeof postFn === "function" && Array.isArray(result)) {
        result.forEach(postFn);
      }
    });
  });
}

function expectIsObservable(flexAccount: FlexAccount) {
  expect(isObservable(flexAccount)).toEqual(true);
  expect(isObservable(flexAccount.meta)).toEqual(true);
  expect(isObservableProp(flexAccount, "_address")).toEqual(true);
  expect(isObservable(flexAccount.publicKey)).toEqual(true);
  expect(isObservableProp(flexAccount, "_privateKey")).toEqual(true);
  expect(isObservableProp(flexAccount, "_spendLimit")).toEqual(true);
  expect(isObservableProp(flexAccount, "_autoSign")).toEqual(true);
  expect(isAction(flexAccount.setSpendLimit)).toEqual(true);
  expect(isAction(flexAccount.enableAutoSign)).toEqual(true);
  expect(isAction(flexAccount.clearAutoSign)).toEqual(true);
}

function createFlexAccounts(Factory: typeof FlexAccount) {
  const endTime = DateTime.now().plus({ minutes: 30 }).toISO()!;
  const strictFlexAccount: Serialized<FlexAccount> = {
    type: "flex-account",
    meta: {
      name: "name",
      icon: "icon",
    },
    address: "address",
    publicKey: {
      type: "tendermint/PubKeySecp256k1",
      value: "publicKey",
    },
    privateKey: "privateKey",
    spendLimit: null,
    autoSign: null,
  };
  const limitedFlexAccount: Serialized<FlexAccount> = {
    ...strictFlexAccount,
    spendLimit: {
      period: {
        days: 7,
      },
      amount: 100,
    },
  };
  const unlockedFlexAccount: Serialized<FlexAccount> = {
    ...limitedFlexAccount,
    autoSign: {
      endTime,
    },
  };

  const previouslyUnlockedFlexAccount: Serialized<FlexAccount> = {
    ...limitedFlexAccount,
    autoSign: {
      endTime: DateTime.now().minus({ minutes: 30 }).toISO()!,
    },
  };

  const allFlexAccounts = {
    strictFlexAccount: Factory.create(strictFlexAccount),
    limitedFlexAccount: Factory.create(limitedFlexAccount),
    unlockedFlexAccount: Factory.create(unlockedFlexAccount),
    previouslyUnlockedFlexAccount: Factory.create(
      previouslyUnlockedFlexAccount,
    ),
  };

  return {
    ...allFlexAccounts,
    all: Object.values(allFlexAccounts),
  };
}

createTest("schema", (FlexAccount) => {
  const { all } = createFlexAccounts(FlexAccount);
  all.forEach((account) => {
    expect(account.schema).toEqual(FlexAccount.schema);
  });
  return all;
});

createTest("type", (FlexAccount) => {
  const { all } = createFlexAccounts(FlexAccount);
  all.forEach((account) => {
    expect(account.type).toEqual("flex-account");
  });
  return all;
});

createTest("meta", (FlexAccount) => {
  const { all } = createFlexAccounts(FlexAccount);
  all.forEach((account) => {
    expect(account.meta).toEqual({
      name: "name",
      icon: "icon",
    });
  });
  return all;
});

createTest("address", (FlexAccount) => {
  const { all } = createFlexAccounts(FlexAccount);
  all.forEach((account) => {
    expect(account.address).toEqual("address");
  });
  return all;
});

createTest("publicKey", (FlexAccount) => {
  const { all } = createFlexAccounts(FlexAccount);
  all.forEach((account) => {
    expect(account.publicKey).toEqual({
      type: "tendermint/PubKeySecp256k1",
      value: "publicKey",
    });
  });
  return all;
});

createTest("privateKey", (FlexAccount) => {
  const { all } = createFlexAccounts(FlexAccount);
  all.forEach((account) => {
    expect(account.privateKey).toEqual("privateKey");
  });
  return all;
});

createTest("spendLimit", (FlexAccount) => {
  const accounts = createFlexAccounts(FlexAccount);
  expect(accounts.strictFlexAccount.spendLimit).toEqual(null);
  [accounts.limitedFlexAccount, accounts.unlockedFlexAccount].forEach(
    (account) => {
      expect(account.spendLimit).toEqual({
        period: {
          days: 7,
        },
        amount: 100,
      });
    },
  );
  return accounts.all;
});

createTest("hasActiveAutoSign", (FlexAccount) => {
  const {
    strictFlexAccount,
    limitedFlexAccount,
    unlockedFlexAccount,
    previouslyUnlockedFlexAccount,
    all,
  } = createFlexAccounts(FlexAccount);
  expect(strictFlexAccount.hasActiveAutoSign).toEqual(false);
  expect(limitedFlexAccount.hasActiveAutoSign).toEqual(false);
  expect(unlockedFlexAccount.hasActiveAutoSign).toEqual(true);
  expect(previouslyUnlockedFlexAccount.hasActiveAutoSign).toEqual(false);
  return all;
});

createTest("remainingAutoSignDuration", (FlexAccount) => {
  const {
    strictFlexAccount,
    limitedFlexAccount,
    unlockedFlexAccount,
    previouslyUnlockedFlexAccount,
    all,
  } = createFlexAccounts(FlexAccount);

  expect(strictFlexAccount.remainingAutoSignDuration).toEqual(null);
  expect(limitedFlexAccount.remainingAutoSignDuration).toEqual(null);
  expect(
    parseInt(
      unlockedFlexAccount.remainingAutoSignDuration?.toFormat("m") ?? "",
      10,
    ),
  ).toBeGreaterThanOrEqual(29);
  expect(previouslyUnlockedFlexAccount.remainingAutoSignDuration).toEqual(null);

  return all;
});

createTest("autoSignEndTime", (FlexAccount) => {
  const {
    strictFlexAccount,
    limitedFlexAccount,
    unlockedFlexAccount,
    previouslyUnlockedFlexAccount,
    all,
  } = createFlexAccounts(FlexAccount);

  expect(strictFlexAccount.autoSignEndTime).toEqual(null);
  expect(limitedFlexAccount.autoSignEndTime).toEqual(null);
  expect(
    parseInt(
      unlockedFlexAccount.autoSignEndTime?.diffNow().toFormat("m") ?? "",
      10,
    ),
  ).toBeGreaterThanOrEqual(29);
  expect(previouslyUnlockedFlexAccount.autoSignEndTime).toEqual(null);

  return all;
});

createTest("toJSON", (FlexAccount) => {
  const { all } = createFlexAccounts(FlexAccount);
  all.forEach((account) => {
    expectIsPureObject(account.toJSON());
  });
});

createTest("equals", (FlexAccount) => {
  const accountsA = createFlexAccounts(FlexAccount);
  const accountsB = createFlexAccounts(FlexAccount);
  expect(
    accountsA.strictFlexAccount.equals(accountsB.strictFlexAccount),
  ).toEqual(true);
  expect(
    accountsA.limitedFlexAccount.equals(accountsB.limitedFlexAccount),
  ).toEqual(true);
  expect(
    accountsA.unlockedFlexAccount.equals(accountsB.unlockedFlexAccount),
  ).toEqual(true);
  expect(
    accountsA.previouslyUnlockedFlexAccount.equals(
      accountsB.limitedFlexAccount,
    ),
  ).toEqual(true);
});

createTest("setSpendLimit", (FlexAccount) => {
  const { all } = createFlexAccounts(FlexAccount);
  all.forEach((account) => {
    account.setSpendLimit({
      amount: 200,
      period: {
        months: 1,
      },
    });
    expect(account.spendLimit).toEqual({
      amount: 200,
      period: {
        months: 1,
      },
    });
  });
  return all;
});

createTest("enableAutoSign", (FlexAccount) => {
  const { all } = createFlexAccounts(FlexAccount);
  all.forEach((account) => {
    account.enableAutoSign(DateTime.now().plus({ minutes: 30 }));
    expect(account.hasActiveAutoSign).toEqual(true);
  });
  return all;
});

createTest("clearAutoSign", (FlexAccount) => {
  const { all } = createFlexAccounts(FlexAccount);
  all.forEach((account) => {
    account.clearAutoSign();
    expect(account.hasActiveAutoSign).toEqual(false);
  });
  return all;
});
