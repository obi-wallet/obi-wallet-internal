export type ToAsset = {
  chainId: string;
  decimals: number;
  label: string;
  denom: string;
  image?: string;
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
};

export const fromAssets: {
  [key: string]: FromAsset;
} = {
  "Eth-ethereum": {
    chainId: "1",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
    label: "Eth (ethereum)",
    image:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  },
  "Usdc-ethereum": {
    image:
      "https://assets.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
    chainId: "1",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    label: "USDC (ethereum)",
  },
  "Eth-arbitrum": {
    chainId: "42161",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
    label: "Eth (arbitrum)",
  },
  "Usdc-arbitrum": {
    chainId: "42161",
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    label: "USDC (arbitrum)",
    image:
      "https://assets.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
  },
  "Eth-base": {
    chainId: "8453",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
    label: "ETH (base)",
  },
  "Usdc-base": {
    image:
      "https://assets.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
    chainId: "8453",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    label: "USDC (base)",
  },
};

export const toAssets = {
  osmosis: {
    chainId: "osmosis-1",
    decimals: 6,
    label: "OSMO",
    denom: "uosmo",
  },
  neutron: {
    chainId: "neutron-1",
    decimals: 6,
    label: "NTRN",
    denom: "untrn",
  },
  "atom-long-neutron": {
    chainId: "neutron-1",
    decimals: 6,
    label: "ATOM Long",
    denom: "10xlong",
  },
  "newt-neutron": {
    chainId: "neutron-1",
    decimals: 6,
    label: "NEWT",
    denom: "unewt",
  },
} as ToAssets;
