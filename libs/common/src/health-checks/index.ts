import { Chain } from "../chains";
import { MultisigWallet } from "../stores";

export type HealthCheck = (wallet: MultisigWallet) => Promise<boolean>;

export enum JunoChecks {
  CODE_ID_AT_LEAST_1311 = "CODE_ID_AT_LEAST_1311",
}

export const junoChecks: Record<JunoChecks, HealthCheck> = {
  [JunoChecks.CODE_ID_AT_LEAST_1311]: async (wallet) => {
    const codeId = wallet.proxyAddress?.codeId;
    return codeId ? codeId >= 1311 : false;
  },
};

export const healthChecks: Record<
  Chain,
  { types: string[]; checks: Record<string, HealthCheck> }
> = {
  "juno-1": {
    types: [JunoChecks.CODE_ID_AT_LEAST_1311],
    checks: junoChecks,
  },
  "uni-3": {
    types: [],
    checks: {},
  },
};
