const commonTwilioConfig = {
  twilioPhoneNumbers: ["+19705509509"],
  twilioUrl:
    "https://studio.twilio.com/v2/Flows/FW278a8ada7d869a2bbfc49915dbb534f5/Executions",
};

export const cosmosChains = {
  "uni-3": {
    chainId: "uni-3" as const,
    label: "Juno Testnet",
    prefix: "juno",
    currentCodeId: 3454,
    rpcs: ["https://rpc.uni.junonetwork.io/"],
    denom: "ujunox",
    startingUsdDebt: "0",
    debtRepayAddress: "juno1ruftad6eytmr3qzmf9k3eya9ah8hsnvkujkej8",
    ...commonTwilioConfig,
    bip44: {
      coinType: 118,
    },
  },
  "juno-1": {
    chainId: "juno-1" as const,
    label: "Juno",
    prefix: "juno",
    currentCodeId: 1311,
    rpcs: [
      "https://juno-rpc.dalnim.finance",
      "https://rpc-juno.itastakers.com/",
    ],
    denom: "ujuno",
    startingUsdDebt: "0",
    debtRepayAddress: "juno1ruftad6eytmr3qzmf9k3eya9ah8hsnvkujkej8",
    ...commonTwilioConfig,
    bip44: {
      coinType: 118,
    },
  },
};

export type CosmosChain = keyof typeof cosmosChains;

// TODO: fetch from https://assets.terra.money/chains.json instead
export const terraChains = {
  "pisco-1": {
    chainId: "pisco-1" as const,
    label: "Terra Testnet",
    accountCreatorAddress:
      "terra1f5adnacrpysy2p0aenl5df05hmmnyfe0pc3598ljnd5l0s5qjkksawdwvw",
    currentCodeId: 6578,
    lcd: "https://pisco-lcd.terra.dev",
    api: "https://pisco-api.terra.dev",
    denom: "uluna",
    startingUsdDebt: "0",
    obiValidator: "terravaloper1src9wvawtfl6ztxss8zu45zuxnwj4ytpnr30jn",
    ...commonTwilioConfig,
  },
  "phoenix-1": {
    chainId: "phoenix-1" as const,
    label: "Terra",
    accountCreatorAddress:
      "terra1a9zykuft0ngvq6ug2j60hz0an2kz72c3vs73tj5m87xcm0dt8w2sdkflln",
    currentCodeId: 1012,
    lcd: "https://terra2-api.dalnim.finance/",
    api: "https://phoenix-api.terra.dev",
    denom: "uluna",
    startingUsdDebt: "0",
    obiValidator: "terravaloper1src9wvawtfl6ztxss8zu45zuxnwj4ytpnr30jn",
    ...commonTwilioConfig,
  },
};

export type TerraChain = keyof typeof terraChains;

export function isCosmosChain(
  chain: CosmosChain | TerraChain
): chain is CosmosChain {
  return Object.keys(cosmosChains).includes(chain);
}

export function isTerraChain(
  chain: CosmosChain | TerraChain
): chain is TerraChain {
  return Object.keys(terraChains).includes(chain);
}
