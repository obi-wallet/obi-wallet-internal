export type ToAsset = {
  chainId: string;
  decimals: number;
  label: string;
  denom: string;
  image?: string;
  disabled?: boolean;
  addressPrefix?: string;
};
type ToAssets = {
  [key: string]: ToAsset;
};
export type FromAsset = {
  chainId: string;
  address: string;
  decimals: number;
  label: string;
  image?: string;
  disabled?: boolean;
};

export const fromAssets: {
  [key: string]: FromAsset;
} = {
  "Eth-ethereum": {
    chainId: "1",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
    label: "ETH (Ethereum)",
    image:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  },
  "Usdc-ethereum": {
    image:
      "https://assets.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
    chainId: "1",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    label: "USDC (Ethereum)",
  },
  "Eth-arbitrum": {
    chainId: "42161",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
    label: "ETH (Arbitrum)",
    image:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  },
  "Usdc-arbitrum": {
    chainId: "42161",
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    label: "USDC (Arbitrum)",
    image:
      "https://assets.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
  },
  "Eth-base": {
    chainId: "8453",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
    label: "ETH (Base)",
    image:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  },
  "Usdc-base": {
    image:
      "https://assets.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
    chainId: "8453",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    label: "USDC (Base)",
  },
};

export const toAssets = {
  sei: {
    chainId: "pacific-1",
    decimals: 6,
    label: "SEI",
    denom: "usei",
    image:
      "https://assets.coingecko.com/coins/images/28205/standard/Sei_Logo_-_Transparent.png?1696527207",
    disabled: false,
    addressPrefix: "sei",
  },
  osmosis: {
    chainId: "osmosis-1",
    decimals: 6,
    label: "OSMO",
    denom: "uosmo",
    image:
      "https://assets.coingecko.com/coins/images/16724/large/osmo.png?1696516298",
    addressPrefix: "osmo",
  },
  neutron: {
    chainId: "neutron-1",
    decimals: 6,
    label: "NTRN",
    denom: "untrn",
    image:
      "https://assets.coingecko.com/coins/images/30813/large/ntrn.png?1696529669",
    addressPrefix: "neutron",
  },

  celestia: {
    chainId: "tia-4", // TODO: change to  tia chain
    decimals: 6,
    label: "Celestia (TIA)",
    denom: "uautism",
    image:
      "https://assets.coingecko.com/coins/images/31967/standard/tia.jpg?1696530772",
    disabled: true,
  },
  autism: {
    chainId: "inj-4", // TODO: change to  injective chain
    decimals: 6,
    label: "AUTISM",
    denom: "uautism",
    image:
      "https://assets.coingecko.com/coins/images/33976/large/autism-logo.png?1703578236",
    disabled: true,
  },

  "atom-long-neutron": {
    chainId: "neutron-1",
    decimals: 6,
    label: "ATOM Long",
    denom: "10xlong",
    image:
      "https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png",
    disabled: true,
  },
  "newt-neutron": {
    chainId: "neutron-1",
    decimals: 6,
    label: "NEWT",
    denom: "unewt",
    image: "https://newt-price.vercel.app/newt-logo.png",
    disabled: true,
  },
} as ToAssets;
