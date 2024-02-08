export enum CosmosSdkChainId {
  Sei = "pacific-1",
  Osmosis = "osmosis-1",
  Neutron = "neutron-1",
  Stargaze = "stargaze-1",
  Tia = "tia-4",
  Inj = "inj-4",
}

export function isCosmosSdkChainId(
  chainId: string,
): chainId is CosmosSdkChainId {
  return Object.values(CosmosSdkChainId).includes(chainId as CosmosSdkChainId);
}

export interface CosmosSdkChainData {
  id: CosmosSdkChainId;
  name: string;
  prefix: string;
  rest: string;
  rpc: string;
  image: string;
  disabled?: boolean;
}

export const CosmosSdkChains: Record<CosmosSdkChainId, CosmosSdkChainData> = {
  [CosmosSdkChainId.Sei]: {
    id: CosmosSdkChainId.Sei,
    name: "Sei",
    rest: "https://sei-api.polkachu.com",
    rpc: "https://sei-rpc.polkachu.com",
    prefix: "sei",
    image:
      "https://assets.coingecko.com/coins/images/28205/standard/Sei_Logo_-_Transparent.png?1696527207",
  },
  [CosmosSdkChainId.Osmosis]: {
    id: CosmosSdkChainId.Osmosis,
    name: "Osmosis",
    rest: "https://lcd.osmosis.zone",
    prefix: "osmo",
    image:
      "https://assets.coingecko.com/coins/images/16724/large/osmo.png?1696516298",
  },
  [CosmosSdkChainId.Neutron]: {
    id: CosmosSdkChainId.Neutron,
    name: "Neutron",
    rest: "https://neutron-api.polkachu.com/",
    prefix: "neutron",
    image:
      "https://assets.coingecko.com/coins/images/30813/large/ntrn.png?1696529669",
  },
  [CosmosSdkChainId.Stargaze]: {
    id: CosmosSdkChainId.Stargaze,
    name: "Stargaze",
    rest: "https://rest.stargaze-apis.com",
    prefix: "stars",
    image:
      "https://assets.coingecko.com/coins/images/22363/large/stargaze_star_pink.png?1702801402",
  },
  [CosmosSdkChainId.Tia]: {
    id: CosmosSdkChainId.Tia,
    name: "Tia",
    rest: "https://celestia-api.lavenderfive.com:443",
    prefix: "tia",
    disabled: true,
    image:
      "https://assets.coingecko.com/coins/images/31967/standard/tia.jpg?1696530772",
  },
  [CosmosSdkChainId.Inj]: {
    id: CosmosSdkChainId.Inj,
    name: "Injective",
    rest: "https://sentry.lcd.injective.network:443",
    prefix: "inj",
    disabled: true,
    image:
      "https://assets.coingecko.com/coins/images/33976/large/autism-logo.png?1703578236",
  },
};
