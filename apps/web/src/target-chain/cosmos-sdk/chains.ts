export enum CosmosSdkChainId {
  Sei = "pacific-1",
  Osmosis = "osmosis-1",
  Neutron = "neutron-1",
  Stargaze = "stargaze-1",
  Tia = "celestia",
  Inj = "injective-1",
}

export function isCosmosSdkChainId(
  chainId: string,
): chainId is CosmosSdkChainId {
  return Object.values<string>(CosmosSdkChainId).includes(chainId);
}

export interface CosmosSdkChainData {
  id: CosmosSdkChainId;
  name: string;
  prefix: string;
  rpcs: string[];
  image: string;
  disabled?: boolean;
}

export const CosmosSdkChains: Record<CosmosSdkChainId, CosmosSdkChainData> = {
  [CosmosSdkChainId.Sei]: {
    id: CosmosSdkChainId.Sei,
    name: "Sei",
    rpcs: ["https://sei-rpc.polkachu.com"],
    prefix: "sei",
    image:
      "https://assets.coingecko.com/coins/images/28205/standard/Sei_Logo_-_Transparent.png?1696527207",
  },
  [CosmosSdkChainId.Osmosis]: {
    id: CosmosSdkChainId.Osmosis,
    name: "Osmosis",
    rpcs: ["https://rpc.osmosis.zone"],
    prefix: "osmo",
    image:
      "https://assets.coingecko.com/coins/images/16724/large/osmo.png?1696516298",
  },
  [CosmosSdkChainId.Neutron]: {
    id: CosmosSdkChainId.Neutron,
    name: "Neutron",
    rpcs: ["https://rpc-lb.neutron.org"],
    prefix: "neutron",
    image:
      "https://assets.coingecko.com/coins/images/30813/large/ntrn.png?1696529669",
  },
  [CosmosSdkChainId.Stargaze]: {
    id: CosmosSdkChainId.Stargaze,
    name: "Stargaze",
    rpcs: ["https://rpc.stargaze-apis.com/"],
    prefix: "stars",
    image:
      "https://assets.coingecko.com/coins/images/22363/large/stargaze_star_pink.png?1702801402",
  },
  [CosmosSdkChainId.Tia]: {
    id: CosmosSdkChainId.Tia,
    name: "Celestia",
    rpcs: ["https://celestia-rpc.publicnode.com:443"],
    prefix: "celestia",
    image:
      "https://assets.coingecko.com/coins/images/31967/standard/tia.jpg?1696530772",
    // disabled: true,
  },
  [CosmosSdkChainId.Inj]: {
    id: CosmosSdkChainId.Inj,
    name: "Injective",
    rpcs: ["https://injective-rpc.publicnode.com:443"],
    prefix: "inj",
    image:
      "https://assets.coingecko.com/coins/images/33976/large/autism-logo.png?1703578236",
  },
};
