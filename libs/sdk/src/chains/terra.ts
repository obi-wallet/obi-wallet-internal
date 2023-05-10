import { commonTwilioConfig } from "./common";

export const terraChains = {
  "pisco-1": {
    chainId: "pisco-1" as const,
    label: "Terra Testnet",
    prefix: "terra",
    accountCreatorAddress:
      "terra1f5adnacrpysy2p0aenl5df05hmmnyfe0pc3598ljnd5l0s5qjkksawdwvw",
    currentCodeIds: {
      userAccount: 6579,
      spendLimitGatekeeper: 6584,
      debtGatekeeper: 6581,
    },
    lcds: ["https://pisco-lcd.terra.dev"],
    api: "https://pisco-api.terra.dev",
    denom: "uluna",
    startingUsdDebt: "0",
    obiValidator: "terravaloper1src9wvawtfl6ztxss8zu45zuxnwj4ytpnr30jn",
    ...commonTwilioConfig,
    bip: [{ path: "m/44'/330'/0'/0/0" }, { path: "m/44'/118'/0'/0/0" }],
    explorerUrl(address: string) {
      return `https://terrasco.pe/testnet/address/${address}`;
    },
  },
  "phoenix-1": {
    chainId: "phoenix-1" as const,
    label: "Terra",
    prefix: "terra",
    accountCreatorAddress:
      "terra1a9zykuft0ngvq6ug2j60hz0an2kz72c3vs73tj5m87xcm0dt8w2sdkflln",
    currentCodeIds: {
      userAccount: 1275,
      spendLimitGatekeeper: 1274,
      debtGatekeeper: 1273,
    },
    lcds: [
      "https://terra2-api.dalnim.finance",
      "https://phoenix-lcd.terra.dev",
    ],
    api: "https://phoenix-fcd.terra.dev",
    denom: "uluna",
    startingUsdDebt: "0",
    obiValidator: "terravaloper1src9wvawtfl6ztxss8zu45zuxnwj4ytpnr30jn",
    ...commonTwilioConfig,
    bip: [{ path: "m/44'/330'/0'/0/0" }, { path: "m/44'/118'/0'/0/0" }],
    explorerUrl(address: string) {
      return `https://terrasco.pe/mainnet/address/${address}`;
    },
  },
};

export type TerraChainId = keyof typeof terraChains;
