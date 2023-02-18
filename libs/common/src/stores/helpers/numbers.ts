import * as t from "io-ts";

export interface PercentageBrand {
  readonly Percentage: unique symbol; // use `unique symbol` here to ensure uniqueness across modules / packages
}

export const Percentage = t.brand(
  t.number,
  (n): n is t.Branded<number, PercentageBrand> => {
    return n >= 0 && n <= 1;
  },
  "Percentage"
);
