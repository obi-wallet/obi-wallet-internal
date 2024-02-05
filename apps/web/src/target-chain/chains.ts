export type ChainData = {
  id: string;
  name: string;
  prefix: string;
  rpc: string;
  image: string;
  disabled?: boolean;
};

export enum TargetChainId {
  Sei = "pacific-1",
  Osmosis = "osmosis-1",
  Neutron = "neutron-1",
  Stargaze = "stargaze-1",
  Tia = "tia-4",
  Inj = "inj-4",
}

export const TargetChains: Record<TargetChainId, ChainData> = {
  [TargetChainId.Sei]: {
    id: "pacific-1",
    name: "Sei",
    rpc: "https://sei-api.polkachu.com",
    prefix: "sei",
    image:
      "https://assets.coingecko.com/coins/images/28205/standard/Sei_Logo_-_Transparent.png?1696527207",
  },
  [TargetChainId.Osmosis]: {
    id: "osmosis-1",
    name: "Osmosis",
    rpc: "https://lcd.osmosis.zone",
    prefix: "osmo",
    image:
      "https://assets.coingecko.com/coins/images/16724/large/osmo.png?1696516298",
  },
  [TargetChainId.Neutron]: {
    id: "neutron-1",
    name: "Neutron",
    rpc: "https://neutron-api.polkachu.com/",
    prefix: "neutron",
    image:
      "https://assets.coingecko.com/coins/images/30813/large/ntrn.png?1696529669",
  },
  [TargetChainId.Stargaze]: {
    id: "stargaze-1",
    name: "Stargaze",
    rpc: "https://rest.stargaze-apis.com",
    prefix: "stars",
    image:
      "https://assets.coingecko.com/coins/images/22363/large/stargaze_star_pink.png?1702801402",
  },
  [TargetChainId.Tia]: {
    id: "tia-4",
    name: "Tia",
    rpc: "https://celestia-api.lavenderfive.com:443",
    prefix: "tia",
    disabled: true,
    image:
      "https://assets.coingecko.com/coins/images/31967/standard/tia.jpg?1696530772",
  },
  [TargetChainId.Inj]: {
    id: "inj-4",
    name: "Injective",
    rpc: "https://sentry.lcd.injective.network:443",
    prefix: "inj",
    disabled: true,
    image:
      "https://assets.coingecko.com/coins/images/33976/large/autism-logo.png?1703578236",
  },
};
