import * as t from "io-ts";

export function nullable<T extends t.Mixed>(type: T) {
  return t.union([type, t.null]);
}
