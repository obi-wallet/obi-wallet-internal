import { useTheme } from "@emotion/react";
import { useQuery, useRootStore } from "@obi-wallet/headless-ui";
import {
  ChainId,
  EnrichedToken as OriginalEnrichedToken,
  Sdk,
  Token,
} from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { FC } from "react";
import { ImageRequireSource, ImageURISource, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import { ethereumBalancesQuery } from "./ethereum-demo";
import { Text } from "../../components";
import { useStore } from "../../contexts";

export function useEnrichedBalances({
  address,
  chainId,
  sortAscending = true,
}: {
  address: string;
  chainId: ChainId;
  sortAscending?: boolean;
}) {
  const balances = useBalances({ address, chainId });
  const prices = usePrices();

  const data =
    balances.data?.map((balance) => {
      return enrichToken({ chainId, token: balance, prices: prices.data });
    }) ?? [];
  data.sort((a, b) => {
    const [first, second] = sortAscending ? [b, a] : [a, b];
    return (first.usdValue ?? 0) - (second.usdValue ?? 0);
  });

  return {
    data,
    isFetching: balances.isFetching || prices.isFetching,
    async refetch() {
      await Promise.all([balances.refetch(), prices.refetch()]);
    },
  };
}

export function useBalances({
  address,
  chainId,
}: {
  address: string;
  chainId: ChainId;
}) {
  const rootStore = useRootStore();
  const theme = useTheme();
  return useQuery(
    theme.ethereumBalances
      ? ethereumBalancesQuery({ address, rootStore })
      : Sdk.chainId(chainId).bank.balancesQuery(address)
  );
}

export function usePrices() {
  const { chainStore } = useStore();
  const chainId = chainStore.currentChain;
  return useQuery(Sdk.chainId(chainId).bank.pricesQuery());
}

export function useUsdBalance({
  address,
  chainId,
}: {
  address: string;
  chainId: ChainId;
}) {
  const balances = useEnrichedBalances({ address, chainId });
  const balanceInUsd = R.sum(
    balances.data.map((coin) => {
      return coin.usdValue ?? 0;
    })
  );
  return `$${balanceInUsd.toFixed(2)}`;
}

export const UsdBalance = observer<{ address: string; chainId: ChainId }>(
  function UsdBalance({ address, chainId }) {
    const balanceInUsd = useUsdBalance({ address, chainId });

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
  }
);

export interface EnrichedToken extends Omit<OriginalEnrichedToken, "icon"> {
  icon: ImageURISource | ImageRequireSource | FC<SvgProps> | null;
}

export function enrichToken({
  chainId,
  token,
  prices,
}: {
  chainId: ChainId;
  token: Token;
  prices?: Record<string, number>;
}): EnrichedToken {
  const enrichedToken = Sdk.chainId(chainId).bank.enrichToken(token, prices);

  switch (token.id) {
    case "0x5CF29823CCFC73008fa53630d54A424AB82dE6F2": {
      const digits = 18;
      return {
        ...token,
        icon: null,
        amount: parseInt(token.rawAmount, 10) / 10 ** digits,
        contract: token.id,
        denom: "ZTX",
        digits,
        label: "Obi ZTX",
        usdValue: null,
      };
    }
    case "eth": {
      const digits = 18;
      return {
        ...token,
        icon: null,
        amount: parseInt(token.rawAmount, 10) / 10 ** digits,
        contract: token.id,
        denom: "ETH",
        digits,
        label: "ETH",
        usdValue: null,
      };
    }
  }

  function getIcon() {
    if (enrichedToken.icon) {
      return { uri: enrichedToken.icon };
    }

    switch (enrichedToken.id) {
      case "ujuno":
        return require("./assets/juno.png");
      case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034":
        return require("./assets/usdc.png");
      case "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup":
        // TODO: modal: handle SVGs
        return null;
      default:
        return null;
    }
  }

  return {
    ...enrichedToken,
    icon: getIcon(),
  };
}
