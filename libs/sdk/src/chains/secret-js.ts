import { commonTwilioConfig } from "./common";

export const secretJsChains = {
  "pulsar-3": {
    chainId: "pulsar-3" as const,
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
  "secret-4": {
    chainId: "secret-4" as const,
    label: "Secret Network",
    prefix: "secret",
    accountCreator: {
      address: "secret15n33l0gyyrdl787hdem6hxlz6wuknxd739r825",
      codeHash:
        "66147ad6e8febf45f6678157e11e32fe0c3f2bd353988e91059f1888260fdde0",
    },
    secretSigner: {
      address: "secret1j8r9v0j3fyafrshraxl537k6jl6azr3m9eyyhx",
      codeHash:
        "46b4b432a8707d239ab7345896140271a92c8542a5a20c6361ec8ce9caa47ad2",
    },
    currentCodeIds: {
      userAccount: 135,
    },
    urls: ["https://lcd.secret.express/", "https://scrt-api.dalnim.finance"],
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
