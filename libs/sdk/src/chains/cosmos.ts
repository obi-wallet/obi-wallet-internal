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
    bip44: {
      coinType: 118,
    },
  },
};

export type CosmosChainId = keyof typeof cosmosChains;
