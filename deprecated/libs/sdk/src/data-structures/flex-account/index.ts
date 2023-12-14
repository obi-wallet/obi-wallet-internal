import { createFlexAccount, createObservableFlexAccount } from "./factories";
import { FlexAccount as FlexAccountInterface } from "./implementation";
import { FlexAccountSchema } from "./schema";

export type FlexAccount = FlexAccountInterface;

export const FlexAccount = {
  schema: FlexAccountSchema,
  create: createFlexAccount,
};

export const ObservableFlexAccount = {
  schema: FlexAccountSchema,
  create: createObservableFlexAccount,
};
