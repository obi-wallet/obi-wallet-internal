import { HotWalletsResponse } from "@obi-wallet/proxy-contract";

import { Chain } from "../chains";
import { createCosmWasmClient } from "../clients";
import { MultisigWallet } from "../stores";

export type HealthCheck = (wallet: MultisigWallet) => Promise<boolean>;

export enum JunoChecks {
  CORRECT_ADMIN = "CORRECT_ADMIN",
  CODE_ID_AT_LEAST_1311 = "CODE_ID_AT_LEAST_1311",
  BIOMETRICS_HOT_WALLET = "BIOMETRICS_HOT_WALLET",
}

export const junoChecks: Record<JunoChecks, HealthCheck> = {
  [JunoChecks.CORRECT_ADMIN]: async (wallet: MultisigWallet) => {
    const currentAdmin = wallet.currentAdmin?.multisig?.address;
    const client = await createCosmWasmClient("juno-1");
    if (!wallet.address) return false;
    const { admin } = await client.getContract(wallet.address);
    if (!admin) return false;
    const account = await client.getAccount(admin);
    if (!account) return false;
    return currentAdmin === account.address;
  },
  [JunoChecks.CODE_ID_AT_LEAST_1311]: async (wallet) => {
    const codeId = wallet.proxyAddress?.codeId;
    return codeId ? codeId >= 1311 : false;
  },
  [JunoChecks.BIOMETRICS_HOT_WALLET]: async (wallet) => {
    const client = await createCosmWasmClient("juno-1");
    if (!wallet.address) return false;
    const biometricsAddress = wallet.currentAdmin?.biometrics?.address;
    if (!biometricsAddress) return false;
    const { hot_wallets: hotWallets }: HotWalletsResponse =
      await client.queryContractSmart(wallet.address, {
        hot_wallets: {},
      });
    return hotWallets.some((hotWallet) => {
      return hotWallet.address === biometricsAddress;
    });
  },
};

export const healthChecks: Record<
  Chain,
  { types: string[]; checks: Record<string, HealthCheck> }
> = {
  "juno-1": {
    types: [
      JunoChecks.CORRECT_ADMIN,
      JunoChecks.CODE_ID_AT_LEAST_1311,
      JunoChecks.BIOMETRICS_HOT_WALLET,
    ],
    checks: junoChecks,
  },
  "uni-3": {
    types: [],
    checks: {},
  },
};
