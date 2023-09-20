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
  "secret-4": {
    chainId: "secret-4" as const,
    label: "Secret Network",
    prefix: "secret",
    accountCreator: {
      address: "secret1fpep0l0su8t6rfsrc5avml4scgt452mycxmdka",
      codeHash:
        "d0872307f0959be7c7bd7933a039b24a2572da7b491dd9630fe198492345346e",
    },
    secretSigner: {
      address: "secret1g0nun830s7e8knw9nk2zz2fufharpufah2clj2",
      codeHash:
        "b1021eddc7dc0b6511d1f7c822b93db34ab9e6c3e34c4f5526500a17973d50a9",
    },
    currentCodeIds: {
      userAccount: 135,
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

export type SecretJsChainId = keyof typeof secretJsChains;
