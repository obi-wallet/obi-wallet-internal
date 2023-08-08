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
      address: "secret1ulkz05xf7d8jyxhgwlkfv4gtapd9zgzlfwsfmk",
      codeHash:
        "fe9e7f8f7a5e72863c5d226230fedd47e0bb7e3be240b7f13a51e4b409abfefc",
    },
    secretSigner: {
      address: "secret12pjj5wuvvvmeud2ggrpp87jjhf00zma6s03jp4",
      codeHash:
        "0d84aa169313fa05a1f3bb0a929cbad6b51a13a3b79c70b655b27d17b53e8160",
    },
    currentCodeIds: {
      userAccount: 135,
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
