import * as balances from "./balances";
import * as contracts from "./contracts";
import * as gasInformation from "./gas-information";
import * as gatekeeper from "./gatekeeper";
import * as helpers from "./helpers";
import * as messages from "./messages";
import * as tokenPairs from "./token-pairs";
import * as tokens from "./tokens";
import * as transactions from "./transactions";
import * as userAccount from "./user-account";
import * as wrapMessages from "./wrap-messages";

export const terra = {
  ...balances,
  ...contracts,
  ...gasInformation,
  ...gatekeeper,
  ...helpers,
  ...messages,
  ...transactions,
  ...userAccount,
  ...wrapMessages,
  ...tokens,
  ...tokenPairs,
};
