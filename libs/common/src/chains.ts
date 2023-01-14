const commonTwilioConfig = {
  twilioPhoneNumbers: ["+19705509509"],
  twilioUrl:
    "https://studio.twilio.com/v2/Flows/FW2de98dc924361e35906dad1ed6125dc6/Executions",
};

export const chains = {
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

export type Chain = keyof typeof chains;

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
    ...commonTwilioConfig,
  },
  "phoenix-1": {
    chainId: "phoenix-1" as const,
    label: "Terra",
    accountCreatorAddress:
      "terra17m6fzkhxwtv8fl5a05ycdfcvzvclarzqwwpdtksknv7dftedgeeqryy7tn",
    currentCodeId: 953,
    lcd: "https://phoenix-lcd.terra.dev",
    api: "https://phoenix-api.terra.dev",
    denom: "uluna",
    startingUsdDebt: "0",
    ...commonTwilioConfig,
  },
};

export type TerraChain = keyof typeof terraChains;

export function isCosmosChain(chain: Chain | TerraChain): chain is Chain {
  return Object.keys(chains).includes(chain);
}

export function isTerraChain(chain: Chain | TerraChain): chain is TerraChain {
  return Object.keys(terraChains).includes(chain);
}
