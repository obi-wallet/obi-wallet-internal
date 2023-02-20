import * as t from "io-ts";

export interface PercentageBrand {
  readonly Percentage: unique symbol;
}

export const UnsafePercentage = t.number;

export const Percentage = t.brand(
  UnsafePercentage,
  (n): n is t.Branded<number, PercentageBrand> => {
    return n >= 0 && n <= 1;
  },
  "Percentage"
);
