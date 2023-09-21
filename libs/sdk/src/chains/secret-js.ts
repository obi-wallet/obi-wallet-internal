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
      userEntry: 1209
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
      address: "secret1737mun4zg4qjcnjnss58qap720hut8dtt7h3vr",
      codeHash:
        "68ef41840240bc3ec23e4557f1a26809c1abfeacacb4de51d2466a5f1b91e0be",
    },
    secretSigner: {
      address: "secret1myqfwq6uf4pakgm79sf3mq0t6hk5v9m7zrglru",
      codeHash:
        "88e477e4a54327737a6079d10b308074d4ed481e5a3d4f1364efda9e349c2ce2",
    },
    currentCodeIds: {
      userAccount: 1230,
      userEntry: 1231,
    },
    // TODO: should get these from account creator directly?
    userAccount: {
      codeHash:
        "a2bdb92fc2d0da51e8e68148b4c7428849a8c750c706fc099fb6c7795101dc57",
    },
    userEntry: {
      codeHash:
        "434fb03295ee088158ed648641b2b196bf6c4108311d695492edeedf0195e97b",
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
