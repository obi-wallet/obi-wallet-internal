import * as balances from "./balances";
import * as helpers from "./helpers";
import * as messages from "./messages";

export const cosmos = {
  ...balances,
  ...helpers,
  ...messages,
};
