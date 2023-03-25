import * as helpers from "./helpers";
import * as messages from "./messages";
import * as tokens from "./tokens";
import * as userAccount from "./user-account";

export const terra = {
  ...helpers,
  ...messages,
  ...userAccount,
  ...tokens,
};
