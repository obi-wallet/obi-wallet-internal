import { commonTwilioConfig } from "./common";

export const cosmosChains = {
  "oasis-3": {
    chainId: "oasis-3" as const,
    label: "Noria Testnet",
    prefix: "noria",
    accountCreatorAddress:
      "noria1yh6sluyed035hvcskhhff5w9l0xm5zgffaq4ewe9w28jaul7tdhqemhygn",
    currentCodeIds: {
      userAccount: 168,
      spendLimitGatekeeper: 172,
      debtGatekeeper: 170,
    },
    rpcs: ["https://archive-rpc.noria.nextnet.zone"],
    denom: "ucrd",
    startingUsdDebt: "0",
    ...commonTwilioConfig,
    bip: [{ path: "m/44'/118'/0'/0/0" }],
    explorerUrl(address: string) {
      return `https://app.noria.network/noria/account/${address}`;
    },
  },
  "osmo-test-5": {
    chainId: "osmo-test-5" as const,
    label: "Osmosis Testnet",
    prefix: "osmo",
    accountCreatorAddress:
      "osmo1f8j9afc8a4j2mr2c9nw20wrrjwr4a084z7fmvv3pkxruzge4ghdsz8t48s",
    currentCodeIds: {
      userAccount: 385,
      spendLimitGatekeeper: 381,
      debtGatekeeper: 378,
    },
    rpcs: ["https://rpc.osmotest5.osmosis.zone/"],
    denom: "uosmo",
    startingUsdDebt: "0",
    ...commonTwilioConfig,
    bip: [{ path: "m/44'/118'/0'/0/0" }],
    explorerUrl(address: string) {
      return `https://explorer.osmotest5.osmosis.zone/osmo-test-5/account/${address}`;
    },
  },
};

export type CosmosChainId = keyof typeof cosmosChains;
