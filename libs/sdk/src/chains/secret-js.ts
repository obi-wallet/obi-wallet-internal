import { commonTwilioConfig } from "./common";

export const secretJsChains = {
  "pulsar-2": {
    chainId: "pulsar-2" as const,
    label: "Secret Network Testnet",
    prefix: "secret",
    accountCreator: {
      address: "secret1ejwjc5kevr4vycgt58gtjnvhgqcjnnptsrt32s",
      codeHash:
        "41504971185998f6c92adde96ec127f3221d3f8547e3366feb2404eacb0c9506",
    },
    secretSigner: {
      address: "secret1tsd3hfrx6djddl74wmd2q2n99ug4gwhaxjrrrj",
      codeHash:
        "c679e7b6be611e804d34b2b4a6514bcd2cfe8b23d6ead87df80306b109f9babf",
    },
    currentCodeIds: {
      userAccount: 22474,
    },
    urls: ["https://api.pulsar.scrttestnet.com:443"],
    denom: "uscrt",
    startingUsdDebt: "0",
    ...commonTwilioConfig,
    bip: [{ path: "m/44'/529'/0'/0/0" }],
    explorerUrl(address: string) {
      return `https://testnet.ping.pub/secret/account/${address}`;
    },
  },
  "pulsar-3": {
    chainId: "pulsar-3" as const,
    label: "Secret Network Testnet",
    prefix: "secret",
    accountCreator: {
      address: "secret1duxxpn9ufxmu0072fheesfmcjfyt0l6mnxrqfq",
      codeHash:
        "41504971185998f6c92adde96ec127f3221d3f8547e3366feb2404eacb0c9506",
    },
    secretSigner: {
      address: "secret1gs8dmf44sea0ahfp6gtul0dpq4lhl3xyztl8qy",
      codeHash:
        "c679e7b6be611e804d34b2b4a6514bcd2cfe8b23d6ead87df80306b109f9babf",
    },
    currentCodeIds: {
      userAccount: 65,
    },
    urls: ["https://api.pulsar3.scrttestnet.com:443"],
    denom: "uscrt",
    startingUsdDebt: "0",
    ...commonTwilioConfig,
    bip: [{ path: "m/44'/529'/0'/0/0" }],
    explorerUrl(address: string) {
      return `https://testnet.ping.pub/secret/account/${address}`;
    },
  },
};

export type SecretJsChainId = keyof typeof secretJsChains;
