"use client";

import { BalanceInputValue, Button, IBalanceOption } from "@/components";
import {
  NewBalance,
  useInvalidateBalancesQueries,
  useNewBalances,
} from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { cn } from "@/lib/utils";
import { TargetChain } from "@/target-chain";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { CustomDropdown as Dropdown } from "@/ui/dropdown";
import { Input } from "@/ui/input";
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
  const balances = useNewBalances({ publicKey });
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
          denom: coin.asset.denom,
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
      setCoin({
        amount: coin.amount,
        asset: initialAsset,
      });
    }
  }, [balanceOptions, coin, params]);

  if (balanceOptions.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className=" text-white">No balances found</p>
      </div>
    );
  }

  return (
    <div className="space-y-7 py-4">
      <Input
        label="Amount"
        placeholder="0.1"
        value={coin.amount}
        onChange={(value) => {
          setCoin({
            amount: value,
            asset: coin.asset,
          });
        }}
        topComponent={
          <div
            className={cn(
              "m-0 text-xs uppercase",
              " cursor-pointer text-slate-500  hover:text-blue-600",
            )}
            onClick={() => {
              if (!coin.asset) return;
              setCoin({
                amount: coin.asset.balance.toString(),
                asset: coin.asset,
              });
            }}
          >
            {coin.asset
              ? `${coin.asset.balance.toString()} ${coin.asset.asset.display}`
              : ""}
          </div>
        }
        rightComponent={
          <Dropdown
            items={balanceOptions}
            selectedItem={coin.asset}
            getKey={(item) => item.denom}
            className="w-48"
            itemComponent={({ getItemProps, item, isSelected }) => (
              <div
                {...getItemProps({ item })}
                className={cn(
                  " hover:bg-background-primary-hover flex cursor-pointer flex-row space-x-3 p-3",
                  isSelected && "bg-gray-600 ",
                  item.disabled &&
                    "cursor-not-allowed opacity-50 hover:bg-gray-600",
                )}
                key={item.denom}
              >
                <div className="flex items-center justify-center ">
                  <img
                    src={item.image}
                    alt={item.network}
                    width={24}
                    height={24}
                  />
                </div>
                <div className="text-white">
                  <div className=" uppercase">{item.asset.display}</div>
                  <div>{item.balance.toString()}</div>
                </div>
              </div>
            )}
            onItemSelect={function (item: IBalanceOption): void {
              setCoin({
                amount: coin.amount,
                asset: item,
              });
            }}
            selectedItemComponent={(selected) => {
              // console.log("selected", selected);
              if (!selected.item) {
                return <div>Selecteame</div>;
              }
              return (
                <div className="flex  w-full cursor-pointer flex-row gap-5 font-normal">
                  <div className="flex items-center   justify-between">
                    <img
                      src={selected.item.image}
                      alt={selected.item.network}
                      className="h-6 w-6"
                    />
                  </div>
                  <div className="text-md flex flex-col items-end font-normal">
                    <div className=" uppercase">
                      {selected.item.asset.display}
                    </div>
                  </div>
                </div>
              );
            }}
          />
        }
      >
        <div className="flex gap-3  text-slate-500">
          <span
            className=" cursor-pointer text-xs hover:text-blue-600"
            onClick={() => {
              setCoin({
                amount: coin.asset?.balance.multipliedBy(0.25).toString() ?? "",
                asset: coin.asset,
              });
            }}
          >
            25%
          </span>
          <span
            className="cursor-pointer  text-xs hover:text-blue-600"
            onClick={() => {
              setCoin({
                amount: coin.asset?.balance.multipliedBy(0.5).toString() ?? "",
                asset: coin.asset,
              });
            }}
          >
            50%
          </span>
          <span
            className="cursor-pointer  text-xs hover:text-blue-600"
            onClick={() => {
              setCoin({
                amount: coin.asset?.balance.multipliedBy(0.75).toString() ?? "",
                asset: coin.asset,
              });
            }}
          >
            75%
          </span>
          <span
            className="cursor-pointer  text-xs hover:text-blue-600"
            onClick={() => {
              setCoin({
                amount: coin.asset?.balance.toString() ?? "",
                asset: coin.asset,
              });
            }}
          >
            100%
          </span>
        </div>
      </Input>
      <Input
        label="Recipient Address"
        placeholder="Enter recipient address"
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
