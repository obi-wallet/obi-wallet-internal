import * as t from "io-ts";

export const DurationInDays = t.type({
  days: t.Int,
});

export const DurationInMonths = t.type({
  months: t.Int,
});

export const DurationInYears = t.type({
  years: t.Int,
});

export const Duration = t.union([
  DurationInDays,
  DurationInMonths,
  DurationInYears,
]);
