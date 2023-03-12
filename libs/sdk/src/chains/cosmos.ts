import { commonTwilioConfig } from "./common";

export const cosmosChains = {
  "uni-3": {
    chainId: "uni-3" as const,
    label: "Juno Testnet",
    prefix: "juno",
    currentCodeId: 3454,
    rpcs: ["https://rpc.uni.junonetwork.io/"],
    denom: "ujunox",
    startingUsdDebt: "0",
    debtRepayAddress: "juno1ruftad6eytmr3qzmf9k3eya9ah8hsnvkujkej8",
    ...commonTwilioConfig,
    bip44: {
      coinType: 118,
    },
  },
  "juno-1": {
    chainId: "juno-1" as const,
    label: "Juno",
    prefix: "juno",
    currentCodeId: 1311,
    rpcs: [
      "https://juno-rpc.dalnim.finance",
      "https://rpc-juno.itastakers.com/",
    ],
    denom: "ujuno",
    startingUsdDebt: "0",
    debtRepayAddress: "juno1ruftad6eytmr3qzmf9k3eya9ah8hsnvkujkej8",
    ...commonTwilioConfig,
    bip44: {
      coinType: 118,
    },
  },
};

export type CosmosChain = keyof typeof cosmosChains;
