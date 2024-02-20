"use client";

import { BalanceInput, Button, IBalanceOption, Input } from "@/components";
import {
  NewBalance,
  useInvalidateBalancesQueries,
  useNewBalances,
} from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { TargetChain } from "@/target-chain";
import { isCosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { nonEmptyString } from "@/validation-helpers";
import { Coin } from "@cosmjs/amino";
import { MsgSendEncodeObject } from "@cosmjs/stargate";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewSignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import invariant from "tiny-invariant";
import { z } from "zod";

const schema = z
  .object({
    coin: z.object({
      amount: z.string(),
      // TODO: This should be more precise
      asset: z.any().optional(),
    }),
    recipient: nonEmptyString("Address"),
  })
  .required()
  .refine(
    (data) => {
      if (!data.coin.asset) return true;
      if (!isCosmosSdkChainId(data.coin.asset.targetChainId)) return true;

      try {
        return TargetChain.chainId(
          data.coin.asset.targetChainId,
        ).validateAddress(data.recipient);
      } catch (_e) {
        return false;
      }
    },
    {
      message: "Invalid address",
    },
  );
type FormData = z.infer<typeof schema>;

export default observer<{ params: { asset?: string[] } }>(function Send({
  params,
}) {
  const form = useForm<FormData>({
    defaultValues: {
      coin: {
        amount: "",
        asset: undefined,
      },
      recipient: "",
    },
    mode: "onTouched",
    resolver: zodResolver(schema),
  });

  const wallet = useCurrentWallet({});
  const publicKey = usePublicKey();
  const balances = useNewBalances({ publicKey });
  const invalidateBalancesQueries = useInvalidateBalancesQueries();

  const send = useMutation({
    mutationFn: async ({ coin, recipient }: FormData) => {
      invariant(wallet, "Wallet not found");
      invariant(coin.asset, "No asset selected");

      const asset = coin.asset as IBalanceOption;

      const chainId = asset.targetChainId;
      const denomUnit = asset.asset.denom_units.find((value) => {
        return value.denom === asset.asset.display;
      });

      const tokens: Coin[] = [
        {
          amount: new BigNumber(coin.amount)
            .multipliedBy(10 ** (denomUnit?.exponent ?? 0))
            .toString(),
          denom: asset.denom,
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
    .filter((b): b is NewBalance => !!b?.balances);

  // add chainId to balance.balances
  const withChainId = balance
    .map((b) => {
      return {
        balances: b?.balances.map((balance) => {
          return {
            ...balance,
            chainId: b.targetChainId,
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

      const result: IBalanceOption = {
        image: assetData.images?.[0]?.svg ?? assetData.images?.[0]?.png,
        targetChainId: b.chainId,
        denom: b.denom,
        network: TargetChain.chainId(b.chainId).label,
        assetUnit: assetData?.symbol,
        balance: decimalAmount,
        asset: assetData,
      };
      return result;
    })
    .filter((option): option is IBalanceOption => !!option);

  useEffect(() => {
    const coin = form.getValues().coin;
    if (coin.asset) return;

    const initialAssetParam = decodeURIComponent(params.asset?.[0] ?? "");

    function getInitialAsset() {
      if (!initialAssetParam) return;

      const [chainId, denom] = initialAssetParam.split(":");
      if (!chainId || !denom) return;

      return balanceOptions.find((balance) => {
        return balance.targetChainId === chainId && balance.denom === denom;
      });
    }

    const initialAsset = initialAssetParam
      ? getInitialAsset()
      : balanceOptions[0];
    if (initialAsset) {
      form.setValue("coin", {
        amount: coin.amount,
        asset: initialAsset,
      });
    }
  }, [balanceOptions, form, params]);

  return (
    <div className="space-y-7 py-4">
      <Controller
        name="coin"
        control={form.control}
        rules={{ required: true }}
        render={({ field }) => {
          return (
            <BalanceInput
              value={field.value}
              onChange={(coin) => {
                field.onChange(coin);
              }}
              label="Amount"
              balances={balanceOptions}
            />
          );
        }}
      />

      <Controller
        name="recipient"
        control={form.control}
        rules={{ required: true }}
        render={({ field }) => {
          return (
            <Input
              labelText="Recipient Address"
              value={field.value}
              onChange={(recipient) => {
                field.onChange(recipient);
              }}
            />
          );
        }}
      />
      <div className="flex justify-end">
        <Button
          className="block w-44"
          disabled={!form.formState.isValid || send.isLoading}
          onClick={form.handleSubmit((data) => {
            send.mutate(data);
          })}
        >
          Next
        </Button>
      </div>
    </div>
  );
});
