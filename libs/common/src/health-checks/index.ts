import { Chain, withCosmosCosmWasmClient } from "@obi-wallet/sdk";

import { MultisigWallet } from "../stores";

export type HealthCheck = (wallet: MultisigWallet) => Promise<boolean>;

export enum JunoChecks {
  CORRECT_ADMIN = "CORRECT_ADMIN",
}

export const junoChecks: Record<JunoChecks, HealthCheck> = {
  [JunoChecks.CORRECT_ADMIN]: async (wallet: MultisigWallet) => {
    const currentOwner = wallet.owner.get().address;
    return await withCosmosCosmWasmClient("juno-1", async (client) => {
      const { admin } = await client.getContract(wallet.address);
      if (!admin) return false;
      const account = await client.getAccount(admin);
      if (!account) return false;
      return currentOwner === account.address;
    });
  },
};

export const healthChecks: Record<
  Chain,
  { types: string[]; checks: Record<string, HealthCheck> }
> = {
  "juno-1": {
    types: [JunoChecks.CORRECT_ADMIN],
    checks: junoChecks,
  },
  "uni-3": {
    types: [],
    checks: {},
  },
  "pisco-1": {
    types: [],
    checks: {},
  },
  "phoenix-1": {
    types: [],
    checks: {},
  },
};
