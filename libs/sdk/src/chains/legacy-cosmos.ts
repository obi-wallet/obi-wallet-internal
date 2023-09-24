import { commonTwilioConfig } from "./common";

export const legacyCosmosChains = {
  "uni-3": {
    chainId: "uni-3" as const,
    label: "Juno Testnet",
    prefix: "juno",
    currentCodeId: 3454,
    rpcs: ["https://rpc.uni.junonetwork.io/"],
    denom: "uscrtx",
    startingUsdDebt: "0",
    debtRepayAddress: "juno1ruftad6eytmr3qzmf9k3eya9ah8hsnvkujkej8",
    ...commonTwilioConfig,
    bip: [{ path: "m/44'/118'/0'/0/0" }],
    explorerUrl(address: string) {
      return `https://testnet.mintscan.io/juno-testnet/account/${address}`;
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
    denom: "uscrt",
    startingUsdDebt: "0",
    debtRepayAddress: "juno1ruftad6eytmr3qzmf9k3eya9ah8hsnvkujkej8",
    ...commonTwilioConfig,
    bip: [{ path: "m/44'/118'/0'/0/0" }],
    explorerUrl(address: string): string {
      return `https://www.mintscan.io/juno/account/${address}`;
    },
  },
};

export type LegacyCosmosChainId = keyof typeof legacyCosmosChains;
