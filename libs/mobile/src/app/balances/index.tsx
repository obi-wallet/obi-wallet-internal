import { Coin } from "@cosmjs/amino";
import { Text } from "@obi-wallet/common";
import { cosmosChains, isCosmosChain, Rewards, Sdk } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { FC } from "react";
import { ImageRequireSource, ImageURISource, View } from "react-native";
import { SvgProps } from "react-native-svg";

import LoopIcon from "./assets/loop.svg";
import { getRootStore } from "../../background/root-store";
import { useQuery } from "../../queries";
import { useMultisigWallet, useStore } from "../stores";

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
  return useQuery(Sdk.chainId(chainId).bank.balancesQuery(address));
}

export function usePrices() {
  const { chainStore } = useStore();
  const chainId = chainStore.currentChain;
  return useQuery(Sdk.chainId(chainId).bank.pricesQuery());
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
  const formattedCoin = Sdk.chainId(
    getRootStore().chainStore.currentChain
  ).formatCoin(coin);

  function getIcon() {
    if (formattedCoin.icon) {
      return formattedCoin.icon;
    }

    switch (coin.denom) {
      case "ujuno":
        return require("./assets/juno.png");
      case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034":
        return require("./assets/usdc.png");
      case "uloop":
        return LoopIcon;
      default:
        return null;
    }
  }

  return {
    ...formattedCoin,
    icon: getIcon(),
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
  const wallet = useMultisigWallet();
  return useQuery(
    Sdk.chainId(wallet.chainId).staking.delegationsQuery(wallet.address)
  );
}

export function useUnbondingDelegations() {
  const wallet = useMultisigWallet();
  return useQuery(
    Sdk.chainId(wallet.chainId).staking.unbondingDelegationsQuery(
      wallet.address
    )
  );
}

export function useValidators() {
  const { chainStore } = useStore();
  const chainId = chainStore.currentChain;
  return useQuery(Sdk.chainId(chainId).staking.validatorsQuery());
}

export function useRewards() {
  const wallet = useMultisigWallet();
  const response = useQuery(
    Sdk.chainId(wallet.chainId).staking.rewardsQuery(wallet.address)
  );
  const fallback: Rewards = {
    perDelegator: [],
    total: { denom: wallet.chain.denom, amount: "0" },
  };
  return {
    ...response,
    data: response.data ?? fallback,
  };
}
