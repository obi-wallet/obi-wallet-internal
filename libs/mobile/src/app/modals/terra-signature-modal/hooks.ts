import axios from "axios";
import { useQuery } from "react-query";

import { useStore } from "../../stores";

const RefetchOptions = {
  DEFAULT: /* onMount, onFocus */ {},
  INFINITY: { staleTime: Infinity, retry: false },
};

const mirror = <T extends object>(obj: T, parentKey?: string): T =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const next = value
      ? mirror(value, key)
      : [parentKey, key].filter(Boolean).join(".");

    return { ...acc, [key]: next };
  }, {} as T);

export const queryKey = mirror({
  /* assets */
  TerraAssets: "",
  TerraAPI: "",
  History: "",

  /* lcd */
  auth: { accountInfo: "" },
  bank: { balance: "", balances: "", supply: "" },
  distribution: {
    rewards: "",
    communityPool: "",
    validatorCommission: "",
    withdrawAddress: "",
  },
  gov: {
    votingParams: "",
    depositParams: "",
    tallyParams: "",
    proposals: "",
    proposal: "",
    deposits: "",
    votes: "",
    tally: "",
  },
  ibc: { denomTrace: "" },
  market: { params: "" },
  oracle: { activeDenoms: "", exchangeRates: "", params: "" },
  tendermint: { nodeInfo: "" },
  staking: {
    validators: "",
    validator: "",
    delegations: "",
    delegation: "",
    unbondings: "",
    pool: "",
  },
  treasury: { taxRate: "", taxCap: "" },
  tx: { txInfo: "", create: "" },
  wasm: { contractInfo: "", contractQuery: "" },

  /* external */
  Anchor: { TotalDeposit: "", APY: "", MarketEpochState: "" },
  TNS: "",
});

export type Amount = string;

export type CoinDenom = string; // uluna | uusd
export type IBCDenom = string; // ibc/...
export type Denom = CoinDenom | IBCDenom;

export type GasPrices = Record<Denom, Amount>;

export const useGasPrices = () => {
  const baseURL = useTerraAPIURL();
  const path = "/gas-prices";

  return useQuery(
    [queryKey.TerraAPI, baseURL, path],
    async () => {
      const { data } = await axios.get<GasPrices>(path, { baseURL });
      return data;
    },
    { ...RefetchOptions.INFINITY, enabled: !!baseURL }
  );
};

export const useTerraAPIURL = () => {
  const { chainStore } = useStore();
  return chainStore.currentTerraChainInformation.api;
};

export const useIsTerraAPIAvailable = () => {
  const url = useTerraAPIURL();
  return !!url;
};
