import {
  ChainId,
  MultisigWallet,
  withCosmJsCosmWasmClient,
} from "@obi-wallet/sdk";

export type HealthCheck = (wallet: MultisigWallet) => Promise<boolean>;

export enum JunoChecks {
  CORRECT_ADMIN = "CORRECT_ADMIN",
}

export const junoChecks: Record<JunoChecks, HealthCheck> = {
  [JunoChecks.CORRECT_ADMIN]: async (wallet: MultisigWallet) => {
    const currentOwner = wallet.owner.address;
    return await withCosmJsCosmWasmClient("juno-1", async (client) => {
      const { admin } = await client.getContract(wallet.address);
      if (!admin) return false;
      const account = await client.getAccount(admin);
      if (!account) return false;
      return currentOwner === account.address;
    });
  },
};

export const healthChecks: Record<
  ChainId,
  { types: string[]; checks: Record<string, HealthCheck> }
> = {
  "oasis-3": {
    types: [],
    checks: {},
  },
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
  "osmo-test-5": {
    types: [],
    checks: {},
  },
  "pulsar-3": {
    types: [],
    checks: {},
  },
  "secret-4": {
    types: [],
    checks: {},
  },
};
