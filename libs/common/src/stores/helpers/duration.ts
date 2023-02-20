import * as t from "io-ts";

export const UnsafeDurationInDays = t.type({
  days: t.number,
});

export const DurationInDays = t.intersection([
  UnsafeDurationInDays,
  t.type({
    days: t.Int,
  }),
]);

export const UnsafeDurationInMonths = t.type({
  months: t.number,
});

export const DurationInMonths = t.intersection([
  UnsafeDurationInMonths,
  t.type({
    months: t.Int,
  }),
]);

export const UnsafeDurationInYears = t.type({
  years: t.number,
});

export const DurationInYears = t.intersection([
  UnsafeDurationInYears,
  t.type({
    years: t.Int,
  }),
]);

export const UnsafeDuration = t.union([
  UnsafeDurationInDays,
  UnsafeDurationInMonths,
  UnsafeDurationInYears,
]);

export const Duration = t.union([
  DurationInDays,
  DurationInMonths,
  DurationInYears,
]);
