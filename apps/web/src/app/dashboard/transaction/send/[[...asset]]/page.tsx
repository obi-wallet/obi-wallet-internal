"use client";

import { toAssets } from "@/app/dashboard/fast-travel/assets";
import {
  BalanceInput,
  BalanceInputValue,
  Button,
  IBalanceOption,
  Input,
} from "@/components";
import {
  Balance,
  useBalances,
  useInvalidateBalancesQueries,
} from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { TargetChain } from "@/target-chain";
import { isCosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { Coin } from "@cosmjs/amino";
import { isDeliverTxSuccess } from "@cosmjs/stargate";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";

const Send = observer<{ params: { asset?: string[] } }>(function Send({
  params,
}) {
  const wallet = useCurrentWallet({});
  const publicKey = usePublicKey();
  const balances = useBalances({ publicKey });
  const invalidateBalancesQueries = useInvalidateBalancesQueries();

  const [coin, setCoin] = useState<BalanceInputValue>({
    amount: "",
    asset: undefined,
  });
  const [recipient, setRecipient] = useState<string>("");

  const send = useMutation({
    mutationFn: async () => {
      if (!wallet || !coin.asset) return;

      const chainId = coin.asset.asset.chainId;
      invariant(
        isCosmosSdkChainId(chainId),
        "ChainId is not a Cosmos SDK chain",
      );

      const tokens: Coin[] = [
        {
          amount: new BigNumber(coin.amount)
            .multipliedBy(10 ** coin.asset.asset.decimals)
            .toString(),
          denom: coin.asset.asset.denom,
        },
      ];

      const signer = await CosmosSdkMpcSigner.fromWallet(wallet, chainId);

      const accounts = await signer.getAccounts();
      const firstAccount = accounts[0];
      if (!firstAccount) return;

      const response = await TargetChain.chainId(
        chainId,
      ).withSigningStargateClient(signer, async (client) => {
        return await client.sendTokens(
          firstAccount.address,
          recipient,
          tokens,
          "auto",
        );
      });
      await invalidateBalancesQueries(chainId);

      if (!isDeliverTxSuccess(response)) {
        throw new Error(response.rawLog);
      }
    },
    onSuccess() {
      window.alert("TX broadcast successfully");
    },
    onError(error: Error) {
      window.alert(`TX failed: ${error.message}`);
    },
  });

  const balance = balances
    .filter((b) => b.isSuccess)
    .map((b) => b.data)
    .filter((b) => b?.balances) as Balance[];

  // add chainId to balance.balances
  const withChainId = balance
    .map((b) => {
      return {
        balances: b?.balances.map((balance) => {
          return {
            ...balance,
            chainId: b.chainId,
          };
        }),
      };
    })
    .map((b) => b.balances)
    .flat();

  const balanceOptions: IBalanceOption[] = withChainId.map((b) => {
    // find the asset in ToAssets using the denom, toAssets is an object and the denom is not the key
    const asset =
      toAssets[
        Object.keys(toAssets).find((key) => toAssets[key]?.denom === b.denom) ??
          ""
      ];
    invariant(asset, "Asset not found");
    const amount = Number(b.amount);
    const decimals = asset?.decimals ?? 0;
    // get amount using the asset's decimals
    const decimalAmount = amount / Math.pow(10, decimals);

    return {
      image: asset?.image,
      network: TargetChain.chainId(b.chainId).label,
      assetUnit: asset?.label,
      balance: decimalAmount,
      asset: asset,
    };
  });

  useEffect(() => {
    if (coin.asset) return;

    const initialAssetParam = params.asset?.[0];
    const initialAsset = initialAssetParam
      ? balanceOptions.find((balance) => {
          return balance.assetUnit === initialAssetParam;
        })
      : balanceOptions[0];
    if (initialAsset) {
      setCoin({
        amount: coin.amount,
        asset: initialAsset,
      });
    }
  }, [balanceOptions, coin, params]);

  return (
    <div className="space-y-7 py-4">
      <BalanceInput
        value={coin}
        onChange={setCoin}
        label="Amount"
        balances={balanceOptions}
      />
      <Input
        labelText="Recipient Address"
        value={recipient}
        onChange={setRecipient}
      />
      <div className="flex justify-end">
        <Button
          className="block w-44"
          onClick={() => {
            send.mutate();
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
});

export default Send;
