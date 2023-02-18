import * as t from "io-ts";

export interface ArrayIndexBrand {
  readonly ArrayIndex: unique symbol;
}

export const ArrayIndex = t.brand(
  t.Integer,
  (n): n is t.Branded<number, ArrayIndexBrand> => {
    return n >= 0;
  },
  "ArrayIndex"
);
