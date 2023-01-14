import * as gasInformation from "./gas-information";
import * as messages from "./messages";
import * as transactions from "./transactions";
import * as wrapMessages from "./wrap-messages";

export const terra = {
  ...gasInformation,
  ...messages,
  ...transactions,
  ...wrapMessages,
};
