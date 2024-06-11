export enum CosmosChainId {
  Sei = "cosmos:pacific-1",
  Osmosis = "cosmos:osmosis-1",
  Neutron = "cosmos:neutron-1",
  Stargaze = "cosmos:stargaze-1",
  Tia = "cosmos:celestia",
  Inj = "cosmos:injective-1",
}

export const allCosmosChains = [
  CosmosChainId.Sei,
  CosmosChainId.Osmosis,
  CosmosChainId.Neutron,
  CosmosChainId.Stargaze,
  CosmosChainId.Tia,
  CosmosChainId.Inj,
];

export function isCosmosChainId(chainId: string): chainId is CosmosChainId {
  return Object.values<string>(CosmosChainId).includes(chainId);
}

export interface CosmosChainData {
  id: CosmosChainId;
  name: string;
  prefix: string;
  rpcs: string[];
  image: string;
  disabled?: boolean;
}

export const CosmosChains: Record<CosmosChainId, CosmosChainData> = {
  [CosmosChainId.Sei]: {
    id: CosmosChainId.Sei,
    name: "Sei",
    rpcs: ["https://sei-rpc.polkachu.com"],
    prefix: "sei",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg",
  },
  [CosmosChainId.Osmosis]: {
    id: CosmosChainId.Osmosis,
    name: "Osmosis",
    rpcs: ["https://rpc.osmosis.zone"],
    prefix: "osmo",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
  },
  [CosmosChainId.Neutron]: {
    id: CosmosChainId.Neutron,
    name: "Neutron",
    rpcs: ["https://rpc-lb.neutron.org"],
    prefix: "neutron",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.svg",
  },
  [CosmosChainId.Stargaze]: {
    id: CosmosChainId.Stargaze,
    name: "Stargaze",
    rpcs: ["https://rpc.stargaze-apis.com/"],
    prefix: "stars",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.svg",
  },
  [CosmosChainId.Tia]: {
    id: CosmosChainId.Tia,
    name: "Celestia",
    rpcs: ["https://celestia-rpc.publicnode.com:443"],
    prefix: "celestia",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg",
  },
  [CosmosChainId.Inj]: {
    id: CosmosChainId.Inj,
    name: "Injective",
    rpcs: ["https://injective-rpc.publicnode.com:443"],
    prefix: "inj",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg",
  },
};
