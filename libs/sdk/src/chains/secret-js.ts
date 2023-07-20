import { commonTwilioConfig } from "./common";

export const secretJsChains = {
  "pulsar-2": {
    chainId: "pulsar-2" as const,
    label: "Secret Network Testnet",
    prefix: "secret",
    accountCreatorAddress: "secret14hguxryx7p8e4w9ug3425dulch60m35svpt9t9",
    currentCodeIds: {
      userAccount: 22474,
    },
    urls: ["https://api.pulsar.scrttestnet.com:443"],
    denom: "uscrt",
    ...commonTwilioConfig,
    bip: [{ path: "m/44'/529'/0'/0/0" }],
    explorerUrl(_address: string) {
      // TODO:
      return "";
    },
  },
};

export type SecretJsChainId = keyof typeof secretJsChains;
