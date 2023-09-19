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
      address: "secret1xtwyzu99xe9q4mvjllmqqcp2vf57z0mlmarhfh",
      codeHash:
        "9e7ba4e89292a644d92933cad975007f22e608548713e6f15cd56d3d46ee210e",
    },
    secretSigner: {
      address: "secret1d9f3ktwfntsfryasesxxwlxcgg4uxd3gxutd8j",
      codeHash:
        "50e9640734c35d4bd15ab31d8795a6f5b3657fe685030105196eba337bfd48c2",
    },
    currentCodeIds: {
      userAccount: 135,
    },
    userEntry: {
      codeHash:
        "d49711cbfb111805d1f0953c6a824be9bb566b5607ac9800141deb68246cda8f",
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
