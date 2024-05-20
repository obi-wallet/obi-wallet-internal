export enum CosmosSdkChainId {
  Sei = "pacific-1",
  Osmosis = "osmosis-1",
  Neutron = "neutron-1",
  Stargaze = "stargaze-1",
  Tia = "celestia",
  Inj = "injective-1",
}

export const allCosmosSdkChainIds = [
  CosmosSdkChainId.Sei,
  CosmosSdkChainId.Osmosis,
  CosmosSdkChainId.Neutron,
  CosmosSdkChainId.Stargaze,
  CosmosSdkChainId.Tia,
  CosmosSdkChainId.Inj,
];

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
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg",
  },
  [CosmosSdkChainId.Osmosis]: {
    id: CosmosSdkChainId.Osmosis,
    name: "Osmosis",
    rpcs: ["https://rpc.osmosis.zone"],
    prefix: "osmo",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
  },
  [CosmosSdkChainId.Neutron]: {
    id: CosmosSdkChainId.Neutron,
    name: "Neutron",
    rpcs: ["https://rpc-lb.neutron.org"],
    prefix: "neutron",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.svg",
  },
  [CosmosSdkChainId.Stargaze]: {
    id: CosmosSdkChainId.Stargaze,
    name: "Stargaze",
    rpcs: ["https://rpc.stargaze-apis.com/"],
    prefix: "stars",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.svg",
  },
  [CosmosSdkChainId.Tia]: {
    id: CosmosSdkChainId.Tia,
    name: "Celestia",
    rpcs: ["https://celestia-rpc.publicnode.com:443"],
    prefix: "celestia",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg",
  },
  [CosmosSdkChainId.Inj]: {
    id: CosmosSdkChainId.Inj,
    name: "Injective",
    rpcs: ["https://injective-rpc.publicnode.com:443"],
    prefix: "inj",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg",
  },
};
