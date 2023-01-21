import * as balances from "./balances";
import * as gasInformation from "./gas-information";
import * as messages from "./messages";
import * as tokenPairs from "./token-pairs";
import * as tokens from "./tokens";
import * as transactions from "./transactions";
import * as wrapMessages from "./wrap-messages";

export const terra = {
  ...balances,
  ...gasInformation,
  ...messages,
  ...transactions,
  ...wrapMessages,
  ...tokens,
  ...tokenPairs,
};
