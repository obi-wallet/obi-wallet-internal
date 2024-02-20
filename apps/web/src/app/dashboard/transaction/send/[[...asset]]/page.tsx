"use client";

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
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { Coin } from "@cosmjs/amino";
import { MsgSendEncodeObject } from "@cosmjs/stargate";
import { NewSignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";

export default observer<{ params: { asset?: string[] } }>(function Send({
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
      invariant(wallet, "Wallet not found");
      invariant(coin.asset, "No asset selected");

      const asset = coin.asset;

      const chainId = coin.asset.targetChainId;
      const denomUnit = asset.asset.denom_units.find((value) => {
        return value.denom === asset.asset.display;
      });

      const tokens: Coin[] = [
        {
          amount: new BigNumber(coin.amount)
            .multipliedBy(10 ** (denomUnit?.exponent ?? 0))
            .toString(),
          denom: asset.asset.base,
        },
      ];

      const signer = await CosmosSdkMpcSigner.fromWallet(wallet, chainId);

      const accounts = await signer.getAccounts();
      const firstAccount = accounts[0];
      invariant(firstAccount, "No account found");

      const message: MsgSendEncodeObject = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          fromAddress: firstAccount.address,
          toAddress: recipient,
          amount: tokens,
        },
      };
      const response =
        await NewSignAndBroadcastTransactionUserInteraction.start({
          messages: [message],
          cancelable: true,
          targetChainId: chainId,
          walletMeta: {
            userEntryAddress: wallet.userEntryAddress,
          },
        });

      await invalidateBalancesQueries(chainId);
      return response;
    },
    onSuccess(response) {
      if (response.approved) {
        const broadcastResult = response.payload;
        if (broadcastResult.success) {
          window.alert("TX broadcast successfully");
        } else {
          window.alert(`TX failed: ${broadcastResult.rawLog}`);
        }
      }
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

  const balanceOptions = withChainId
    .map((b) => {
      const assetData = TargetChain.chainId(b.chainId).getAsset(b.denom);
      if (!assetData) return null;

      const amount = new BigNumber(b.amount);
      const denomUnit = assetData.denom_units.find((value) => {
        return value.denom === assetData.display;
      });
      const decimalAmount = amount.dividedBy(10 ** (denomUnit?.exponent ?? 0));

      return {
        image: assetData.images?.[0]?.svg ?? assetData.images?.[0]?.png,
        targetChainId: b.chainId,
        network: TargetChain.chainId(b.chainId).label,
        assetUnit: assetData?.symbol,
        balance: decimalAmount,
        asset: assetData,
      };
    })
    .filter((option): option is IBalanceOption => !!option);

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
          disabled={send.isLoading}
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
