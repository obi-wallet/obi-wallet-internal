import { commonTwilioConfig } from "./common";

export const SecretJsChainIds = {
  PULSAR_TESTNET: "pulsar-3",
  MAINNET: "secret-4",
} as const;

export const SecretJsChains = {
  [SecretJsChainIds.PULSAR_TESTNET]: {
    chainId: SecretJsChainIds.PULSAR_TESTNET,
    label: "Secret Network Testnet",
    prefix: "secret",
    accountCreator: {
      address: "secret1n3s2vcwza7lz3j0gqc8k2e0gpu0q0ycmckgr0g",
      codeHash:
        "66147ad6e8febf45f6678157e11e32fe0c3f2bd353988e91059f1888260fdde0",
    },
    secretSigner: {
      address: "secret1tsw07lzugyqwrez34v85e73a3uet0uha83phne",
      codeHash:
        "85cecdb5dd9447c43114abd35de4b99450994e411e77bc15b0f7d6d3a2b5aacc",
    },
    currentCodeIds: {
      userAccount: 135,
      userEntry: 1209,
    },
    // TODO: should get these from account creator directly?
    userAccount: {
      codeHash:
        "c86782c2a7d9611ff428a05bed206c6b0f2aafcbc121cbe5a8648457b36d2da1",
    },
    userEntry: {
      codeHash:
        "143cca05044f43c8d4112b22eef6786809a3c9e69c28131179166f52df11c2f6",
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
  [SecretJsChainIds.MAINNET]: {
    chainId: SecretJsChainIds.MAINNET,
    label: "Secret Network",
    prefix: "secret",
    accountCreator: {
      address: "secret1q9y3lkp7tf5lp58ay8rx0uq0cjdcszh7jwcrfq",
      codeHash:
        "41090bebea0925e73222a6b762d09307c5b3d3102454f2234fc5d4ea501119d2",
    },
    secretSigner: {
      address: "secret1nc35zkv02ktsas3cw4slg39ulleurr2feum06g",
      codeHash:
        "e26b01b8b1b4b2f6ae6058c9ca8321b63ec92b40c3c63b8e685b52eaf6a4cef2",
    },
    currentCodeIds: {
      userAccount: 1267,
      userEntry: 1268,
    },
    // TODO: should get these from account creator directly?
    userAccount: {
      codeHash:
        "84500d2a82ac68b7f346b5b6bbf86876be247130882e15b12b1a2689072ed1e1",
    },
    userEntry: {
      codeHash:
        "2d1c2b0395289f21b4f00bfd83d9e9cea77277e578ad2591b89064998424122d",
    },
    urls: ["https://scrt-api.dalnim.finance", "https://lcd.secret.express/"],
    denom: "uscrt",
    startingUsdDebt: "0",
    ...commonTwilioConfig,
    bip: [{ path: "m/44'/529'/0'/0/0" }],
    explorerUrl(address: string) {
      return `https://testnet.ping.pub/secret/account/${address}`;
    },
  },
};

export type SecretJsChainId =
  (typeof SecretJsChainIds)[keyof typeof SecretJsChainIds];
