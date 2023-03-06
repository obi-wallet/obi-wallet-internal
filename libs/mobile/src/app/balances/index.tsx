import { Coin } from "@cosmjs/amino";
import {
  cosmosChains,
  isCosmosChain,
  Rewards,
  terra,
  Text,
} from "@obi-wallet/common";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { FC } from "react";
import { ImageRequireSource, ImageURISource, View } from "react-native";
import { SvgProps } from "react-native-svg";

import BottleIcon from "./assets/bottle.svg";
import DrinkIcon from "./assets/drink.svg";
import LoopIcon from "./assets/loop.svg";
import { getRootStore } from "../../background/root-store";
import {
  getBalancesQuery,
  getDelegationsQuery,
  getPricesQuery,
  getRewardsQuery,
  getUnbondingDelegations,
  getValidatorsQuery,
} from "../../queries";
import { useStore } from "../stores";

export interface ExtendedCoin {
  contract?: string;
  denom: string;
  amount: string;
  usdPrice: number;
}

export function useBalances({
  address,
  sortAscending = true,
}: {
  address: string;
  sortAscending?: boolean;
}) {
  const rawBalances = useRawBalances({ address });
  const prices = usePrices();

  const data =
    rawBalances.data?.map((balance) => {
      return {
        ...balance,
        usdPrice: prices.data?.[balance.denom] ?? 0,
      };
    }) ?? [];
  data.sort((a, b) => {
    const [first, second] = sortAscending ? [b, a] : [a, b];
    return (
      formatExtendedCoin(first).valueInUsd -
      formatExtendedCoin(second).valueInUsd
    );
  });

  return {
    data,
    isFetching: rawBalances.isFetching || prices.isFetching,
    async refetch() {
      await Promise.all([rawBalances.refetch(), prices.refetch()]);
    },
  };
}

export function useRawBalances({ address }: { address: string }) {
  const { chainStore } = useStore();
  const chainId = chainStore.currentChain;
  return useQuery(getBalancesQuery({ chainId, address }));
}

export function usePrices() {
  const { chainStore } = useStore();
  const chainId = chainStore.currentChain;
  return useQuery(getPricesQuery({ chainId }));
}

export function useUsdBalance({ address }: { address: string }) {
  const balances = useBalances({ address });
  const balanceInUsd = R.sum(
    balances.data.map((coin) => {
      return formatExtendedCoin(coin).valueInUsd;
    })
  );
  return `$${balanceInUsd.toFixed(2)}`;
}

export const UsdBalance = observer<{ address: string }>(function UsdBalance({
  address,
}) {
  const balanceInUsd = useUsdBalance({ address });

  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      <Text
        style={{
          color: "#F6F5FF",
          fontSize: 28,
          fontWeight: "500",
          alignSelf: "flex-end",
          marginBottom: 2,
        }}
      >
        {balanceInUsd}
      </Text>
    </View>
  );
});

export interface FormattedCoin {
  icon: ImageURISource | ImageRequireSource | FC<SvgProps> | null;
  denom: string;
  digits: number;
  label: string;
  amount: number;
}

export function formatCoin(coin: Coin): FormattedCoin {
  if (R.has(coin.denom, terra.tokens)) {
    const token = terra.tokens[coin.denom as keyof typeof terra.tokens];
    const denom =
      R.prop("base_denom", token) ??
      R.prop("denom", token) ??
      R.prop("symbol", token) ??
      coin.denom;

    return {
      icon: token.icon ? { uri: token.icon } : null,
      denom: (() => {
        if (denom.startsWith("u")) {
          return denom.slice(1).toUpperCase();
        }

        if (denom.startsWith("terra1")) {
          return "";
        }

        return denom;
      })(),
      digits: token.decimals,
      label: R.prop("name", token) ?? R.prop("symbol", token) ?? coin.denom,
      amount: parseInt(coin.amount, 10) / 10 ** token.decimals,
    };
  }

  const { currentChain } = getRootStore().chainStore;

  if (isCosmosChain(currentChain)) {
    const { denom } = cosmosChains[currentChain];

    switch (coin.denom) {
      case denom: {
        const digits = 6;
        const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
        return {
          icon: denom.includes("ujuno") ? require("./assets/juno.png") : null,
          denom: denom.slice(1).toUpperCase(),
          digits,
          label: denom[1].toUpperCase() + denom.slice(2),
          amount,
        };
      }
      case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034": {
        const digits = 6;
        const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
        return {
          icon: require("./assets/usdc.png"),
          denom: "axlUSDC",
          digits,
          label: "USDC (Axelar)",
          amount,
        };
      }
      case "uloop": {
        const digits = 6;
        const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
        return {
          icon: LoopIcon,
          denom: "LOOP",
          digits,
          label: "Loop",
          amount,
        };
      }
      case "udrink": {
        const digits = 6;
        const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
        return {
          icon: DrinkIcon,
          denom: "DRINK",
          digits,
          label: "Drink",
          amount,
        };
      }
      case "ubottle": {
        const digits = 6;
        const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
        return {
          icon: BottleIcon,
          denom: "BOTTLE",
          digits,
          label: "Bottle",
          amount,
        };
      }
    }
  }

  const digits = 6;
  const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
  return {
    icon: null,
    denom: coin.denom,
    digits: 6,
    label: "Unknown Token",
    amount: amount,
  };
}

export function formatExtendedCoin(coin: ExtendedCoin) {
  const formattedCoin = formatCoin(coin);
  const { currentChain } = getRootStore().chainStore;

  if (isCosmosChain(currentChain)) {
    const { denom } = cosmosChains[currentChain];

    switch (coin.denom) {
      case denom: {
        const usdValue = coin.usdPrice / Math.pow(10, formattedCoin.digits);
        return {
          ...formattedCoin,
          valueInUsd: formattedCoin.amount * usdValue,
        };
      }
      case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034": {
        return {
          ...formattedCoin,
          valueInUsd: formattedCoin.amount,
        };
      }
      case "uloop": {
        const usdValue = coin.usdPrice / Math.pow(10, formattedCoin.digits);
        return {
          ...formattedCoin,
          valueInUsd: usdValue * formattedCoin.amount,
        };
      }
    }
  }

  return {
    ...formattedCoin,
    valueInUsd: formattedCoin.amount * coin.usdPrice,
  };
}

export function useDelegations() {
  const { chainStore, walletsStore } = useStore();
  const address = walletsStore.address;
  const chainId = chainStore.currentChain;
  return useQuery(getDelegationsQuery({ chainId, address }));
}

export function useUnbondingDelegations() {
  const { chainStore, walletsStore } = useStore();
  const address = walletsStore.address;
  const chainId = chainStore.currentChain;
  return useQuery(getUnbondingDelegations({ chainId, address }));
}

export function useValidators() {
  const { chainStore } = useStore();
  const chainId = chainStore.currentChain;
  return useQuery(getValidatorsQuery({ chainId }));
}

export function useRewards() {
  const { chainStore, walletsStore } = useStore();
  const address = walletsStore.address;
  const chainId = chainStore.currentChain;
  const response = useQuery(getRewardsQuery({ chainId, address }));

  const fallback: Rewards = {
    perDelegator: [],
    total: { denom: chainStore.currentChainInformation.denom, amount: "0" },
  };
  return {
    ...response,
    data: response.data ?? fallback,
  };
}
