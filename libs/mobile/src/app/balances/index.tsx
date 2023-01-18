import { Coin } from "@cosmjs/amino";
import { terra, Text } from "@obi-wallet/common";
import * as R from "ramda";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { ImageRequireSource, ImageURISource, View } from "react-native";
import { SvgProps } from "react-native-svg";

import { getRootStore } from "../../background/root-store";
import { useStore } from "../stores";
import BottleIcon from "./assets/bottle.svg";
import DrinkIcon from "./assets/drink.svg";
import LoopIcon from "./assets/loop.svg";

export interface ExtendedCoin {
  contract?: string;
  denom: string;
  amount: string;
  usdPrice: number;
}

export interface FormattedExtendedCoin {
  icon: ReactNode;
  denom: string;
  digits: number;
  label: string;
  amount: number;
}

export function useBalances() {
  const { balancesStore, walletsStore } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const refreshBalances = useCallback(async () => {
    setRefreshing(true);
    await balancesStore.fetchBalances();
    setRefreshing(false);
  }, [balancesStore]);

  useEffect(() => {
    void refreshBalances();
  }, [refreshBalances, walletsStore.address]);

  return {
    balances: balancesStore.balances,
    refreshBalances,
    refreshing,
  };
}

export function UsdBalance({ fontSize = 28 }: { fontSize?: number }) {
  const scale = fontSize / 28;
  const { balances } = useBalances();
  const balanceInUsd = balances.reduce(
    (acc, coin) => acc + formatExtendedCoin(coin).valueInUsd,
    0
  );
  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      <Text
        style={{
          color: "#F6F5FF",
          fontSize: 20 * scale,
          fontWeight: "500",
          alignSelf: "flex-end",
          marginBottom: 2,
        }}
      >
        $
      </Text>
      <Text
        style={{
          color: "#F6F5FF",
          fontSize: 28 * scale,
          fontWeight: "500",
        }}
      >
        {balanceInUsd.toFixed(2).split(".")[0]}.
      </Text>
      <Text
        style={{
          color: "#F6F5FF",
          fontSize: 28 * scale,
          fontWeight: "normal",
        }}
      >
        {balanceInUsd.toFixed(2).split(".")[1]}
      </Text>
    </View>
  );
}

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

  const { denom } = getRootStore().chainStore.currentCosmosChainInformation;
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
    default: {
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
  }
}

export function formatExtendedCoin(coin: ExtendedCoin) {
  const { denom } = getRootStore().chainStore.currentCosmosChainInformation;
  const formattedCoin = formatCoin(coin);

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
    default: {
      return {
        ...formattedCoin,
        valueInUsd: formattedCoin.amount * coin.usdPrice,
      };
    }
  }
}

export function useDelegations() {
  const { balancesStore, walletsStore } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const refreshDelegations = useCallback(async () => {
    setRefreshing(true);
    await balancesStore.fetchDelegations();
    setRefreshing(false);
  }, [balancesStore]);

  useEffect(() => {
    void refreshDelegations();
  }, [refreshDelegations, walletsStore.address]);

  return {
    delegations: balancesStore.delegations,
    refreshDelegations,
    refreshing,
  };
}
