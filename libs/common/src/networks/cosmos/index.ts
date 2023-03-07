import * as balances from "./balances";
import * as contracts from "./contracts";
import * as helpers from "./helpers";
import * as messages from "./messages";

export const cosmos = {
  ...balances,
  ...contracts,
  ...helpers,
  ...messages,
};
