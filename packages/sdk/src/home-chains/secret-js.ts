export enum SecretJsHomeChainId {
  PULSAR_TESTNET = "pulsar-3",
  MAINNET = "secret-4",
}

export const SecretJsHomeChains = {
  [SecretJsHomeChainId.PULSAR_TESTNET]: {
    chainId: SecretJsHomeChainId.PULSAR_TESTNET,
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
    bip: [{ path: "m/44'/529'/0'/0/0" }],
    explorerUrl(address: string) {
      return `https://testnet.ping.pub/secret/account/${address}`;
    },
  },
  [SecretJsHomeChainId.MAINNET]: {
    chainId: SecretJsHomeChainId.MAINNET,
    label: "Secret Network",
    prefix: "secret",
    accountCreator: {
      address: "secret1ade0mzc37z7lgqfrmmd6w6wm800t26kmkz6xnj",
      codeHash:
        "b63651c0b205a1beff039c57d0b1e898ce72b4739b2739dba33885d861e8c42f",
    },
    secretSigner: {
      address: "secret1waecxrv74zeftvxznlrtet8z3wzej0wnwgx4nw",
      codeHash:
        "85c1bdcb93c60e4318ab6cbfc19b6bd1603dd09e812bb5b3edb2a0222c369b49",
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
    bip: [{ path: "m/44'/529'/0'/0/0" }],
    explorerUrl(address: string) {
      return `https://testnet.ping.pub/secret/account/${address}`;
    },
  },
};
