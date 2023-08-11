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
    feeManager: {
      address: "",
      codeHash: "",
      homeChainId: "",
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
      address: "secret1cy4kqk25sha6slfywln9aud7epw4mkgw2r5edt",
      codeHash:
        "801ea84592db2ff6618c9fc50030100beeb0042ff48481e0e7bfd1f553a6093a",
    },
    feeManager: {
      address: "secret1kj8n9kr9k4fvztewxg6pzh4tmq6h79y2y0pma2",
      codeHash:
        "dae6836c9c01179e24b82d9dcb16f5917f4e4e9eceea0b7b66fd5aa79b75982c",
      homeChainId: "5",
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
