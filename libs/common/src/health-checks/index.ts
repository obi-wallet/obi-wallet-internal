import { Chain } from "../chains";
import { createCosmWasmClient } from "../clients";
import { cosmos } from "../networks";
import { MultisigWallet } from "../stores";

export type HealthCheck = (wallet: MultisigWallet) => Promise<boolean>;

export enum JunoChecks {
  CORRECT_ADMIN = "CORRECT_ADMIN",
  CODE_ID_AT_LEAST_1311 = "CODE_ID_AT_LEAST_1311",
}

export const junoChecks: Record<JunoChecks, HealthCheck> = {
  [JunoChecks.CORRECT_ADMIN]: async (wallet: MultisigWallet) => {
    const currentOwner = cosmos.getAddress({
      publicKey: cosmos.createMultisigPublicKey({
        multisigKey: wallet.owner,
      }),
      chainId: "juno-1",
    });
    const client = await createCosmWasmClient("juno-1");
    const { admin } = await client.getContract(wallet.address);
    if (!admin) return false;
    const account = await client.getAccount(admin);
    if (!account) return false;
    return currentOwner === account.address;
  },
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
    types: [JunoChecks.CORRECT_ADMIN, JunoChecks.CODE_ID_AT_LEAST_1311],
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
