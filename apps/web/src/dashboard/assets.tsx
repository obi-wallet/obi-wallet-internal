import { CosmosChainId } from "@/target-chain/cosmos/chains";
import { Caip2ChainId } from "@obi-wallet/sdk-caip";

export interface ToAsset {
  chainId: Caip2ChainId;
  decimals: number;
  label: string;
  denom: string;
  image?: string;
  disabled?: boolean;
  addressPrefix?: string;
}

export interface FromAsset {
  address: string;
  decimals: number;
  label: string;
  image?: string;
  disabled?: boolean;
}

export const fromAssets: Record<string, FromAsset> = {
  eth: {
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
    label: "ETH",
    image:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  },
};

export const toAssets: Record<string, ToAsset> = {
  stars: {
    chainId: CosmosChainId.Stargaze,
    decimals: 6,
    label: "STARS",
    denom: "ustars",
    image:
      "https://assets.coingecko.com/coins/images/22363/large/stargaze_star_pink.png?1702801402",
    disabled: false,
    addressPrefix: "stars",
  },
  sei: {
    chainId: CosmosChainId.Sei,
    decimals: 6,
    label: "SEI",
    denom: "usei",
    image:
      "https://assets.coingecko.com/coins/images/28205/standard/Sei_Logo_-_Transparent.png?1696527207",
    disabled: false,
    addressPrefix: "sei",
  },
  osmosis: {
    chainId: CosmosChainId.Osmosis,
    decimals: 6,
    label: "OSMO",
    denom: "uosmo",
    image:
      "https://assets.coingecko.com/coins/images/16724/large/osmo.png?1696516298",
    addressPrefix: "osmo",
  },
  neutron: {
    chainId: CosmosChainId.Neutron,
    decimals: 6,
    label: "NTRN",
    denom: "untrn",
    image:
      "https://assets.coingecko.com/coins/images/30813/large/ntrn.png?1696529669",
    addressPrefix: "neutron",
  },

  newt: {
    chainId: CosmosChainId.Neutron,
    decimals: 6,
    label: "NEWT",
    denom: "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
    image: "https://newt-price.vercel.app/newt-logo.png",
  },

  apollo: {
    chainId: CosmosChainId.Neutron,
    decimals: 6,
    label: "Apollo",
    denom:
      "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
    image:
      "https://assets.coingecko.com/coins/images/34792/large/apollo-png-256.png?1706031403",
    disabled: false,
  },
  usdc: {
    chainId: "cosmos:axelar-dojo-1",
    decimals: 6,
    label: "axlUSDC",
    denom:
      "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
    image:
      "https://assets.coingecko.com/coins/images/26476/large/uausdc_D_3x.png?1696525548",
    disabled: false,
  },
  celestia: {
    chainId: CosmosChainId.Tia,
    decimals: 6,
    label: "Celestia (TIA)",
    denom: "utia",
    image:
      "https://assets.coingecko.com/coins/images/31967/standard/tia.jpg?1696530772",
    disabled: true,
  },
  autism: {
    chainId: CosmosChainId.Inj,
    decimals: 6,
    label: "AUTISM",
    denom: "uautism",
    image:
      "https://assets.coingecko.com/coins/images/33976/large/autism-logo.png?1703578236",
    disabled: true,
  },
};
