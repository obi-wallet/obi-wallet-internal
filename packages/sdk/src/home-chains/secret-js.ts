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
        "18dc025952aaf371d366e474c088d473b6281e924877fe0bba65209b4a17074e",
    },
    currentCodeIds: {
      userAccount: 135,
      userEntry: 1209,
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
      address: "secret1j4y0vnhjqen8efjsqzhvslaphgl6szaq96002v",
      codeHash:
        "8a50e15844d996fec54306fce3dbe563cb1e4d45346177c0e3baf462324715e5",
    },
    secretSigner: {
      address: "secret146zlhvjws92znj6898kxpcyjs9mfrlgzpl5u5y",
      codeHash:
        "18dc025952aaf371d366e474c088d473b6281e924877fe0bba65209b4a17074e",
    },
    currentCodeIds: {
      userAccount: 1267,
      userEntry: 1268,
    },
    urls: ["https://scrt-api.dalnim.finance", "https://scrt-api.bodhi.money/"],
    denom: "uscrt",
    startingUsdDebt: "0",
    bip: [{ path: "m/44'/529'/0'/0/0" }],
    explorerUrl(address: string) {
      return `https://testnet.ping.pub/secret/account/${address}`;
    },
  },
};
