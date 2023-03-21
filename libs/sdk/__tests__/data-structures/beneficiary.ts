import { isAction, isObservable, isObservableProp } from "mobx";
import * as R from "ramda";

import { Beneficiary, ObservableBeneficiary, Serialized } from "../../src";
import { expectIsPureObject } from "../__helpers__";

function createTest<
  A extends (factory: typeof Beneficiary) => Beneficiary[] | void
>(name: string, fn: A) {
  return describe(name, () => {
    test.each([
      {
        name: "Beneficiary",
        Beneficiary: Beneficiary,
      },
      {
        name: "ObservableBeneficiary",
        Beneficiary: ObservableBeneficiary,
        postFn: expectIsObservable,
      },
    ])(`$name`, ({ Beneficiary, postFn }) => {
      const result = fn(Beneficiary);
      if (typeof postFn === "function" && Array.isArray(result)) {
        result.forEach(postFn);
      }
    });
  });
}

function expectIsObservable(beneficiary: Beneficiary) {
  expect(isObservable(beneficiary)).toEqual(true);
  expect(isObservable(beneficiary.meta)).toEqual(true);
  expect(isObservableProp(beneficiary, "_address")).toEqual(true);
  expect(isObservable(beneficiary.dormancyThreshold)).toEqual(true);
  expect(isObservable(beneficiary.dripSchedule)).toEqual(true);
  expect(isAction(beneficiary.setDormancyThreshold)).toEqual(true);
  expect(isAction(beneficiary.setDripRate)).toEqual(true);
  expect(isAction(beneficiary.setDripPeriod)).toEqual(true);
}

const fixture: Serialized<Beneficiary> = {
  type: "beneficiary",
  meta: {
    name: "name",
    icon: "icon",
  },
  address: "address",
  dormancyThreshold: {
    years: 1,
  },
  dripSchedule: {
    rate: 0.05,
    period: {
      months: 1,
    },
  },
};

createTest("schema", (Beneficiary) => {
  const beneficiary = Beneficiary.create(fixture);
  expect(beneficiary.schema).toEqual(Beneficiary.schema);
  return [beneficiary];
});

createTest("type", (Beneficiary) => {
  const beneficiary = Beneficiary.create(fixture);
  expect(beneficiary.type).toEqual("beneficiary");
  return [beneficiary];
});

createTest("meta", (Beneficiary) => {
  const beneficiary = Beneficiary.create(fixture);
  expect(beneficiary.meta).toEqual(fixture.meta);
  return [beneficiary];
});

createTest("address", (Beneficiary) => {
  const beneficiary = Beneficiary.create(fixture);
  expect(beneficiary.address).toEqual(fixture.address);
  return [beneficiary];
});

createTest("dormancyThreshold", (Beneficiary) => {
  const beneficiary = Beneficiary.create(fixture);
  expect(beneficiary.dormancyThreshold).toEqual(fixture.dormancyThreshold);
  return [beneficiary];
});

createTest("dripSchedule", (Beneficiary) => {
  const beneficiary = Beneficiary.create(fixture);
  expect(beneficiary.dripSchedule.rate).toEqual(fixture.dripSchedule.rate);
  expect(beneficiary.dripSchedule.period).toEqual(fixture.dripSchedule.period);
  return [beneficiary];
});

createTest("toJSON", (Beneficiary) => {
  const beneficiary = Beneficiary.create(fixture);
  const serialized = beneficiary.toJSON();
  expect(serialized).toEqual(fixture);
  expectIsPureObject(serialized);
});

createTest("equals", (Beneficiary) => {
  const a = Beneficiary.create(R.clone(fixture));
  const b = Beneficiary.create(R.clone(fixture));
  expect(a.equals(b)).toEqual(true);
});

createTest("setDormancyThreshold", (Beneficiary) => {
  const beneficiary = Beneficiary.create(fixture);
  beneficiary.setDormancyThreshold({
    years: 2,
  });
  expect(beneficiary.dormancyThreshold).toEqual({
    years: 2,
  });
  return [beneficiary];
});

createTest("setDripRate", (Beneficiary) => {
  const beneficiary = Beneficiary.create(fixture);
  beneficiary.setDripRate(0.1);
  expect(beneficiary.dripSchedule.rate).toEqual(0.1);
  return [beneficiary];
});

createTest("setDripPeriod", (Beneficiary) => {
  const beneficiary = Beneficiary.create(fixture);
  beneficiary.setDripPeriod({
    months: 2,
  });
  expect(beneficiary.dripSchedule.period).toEqual({
    months: 2,
  });
  return [beneficiary];
});
