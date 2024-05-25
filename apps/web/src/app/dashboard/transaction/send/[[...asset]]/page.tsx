"use client";

import { Button, IBalanceOption, Text } from "@/components";
import { useAlert } from "@/hooks/alert";
import {
  AssetWithPrice,
  useBalances,
  useInvalidateBalancesQueries,
} from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { cn } from "@/lib/utils";
import { TargetChain } from "@/target-chain";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { isEvmChainId } from "@/target-chain/evm/chains";
import { CustomDropdown as Dropdown } from "@/ui/dropdown";
import { Input } from "@/ui/input";
import { SignAndBroadcastEvm } from "@/user-interactions/sign-and-broadcast/evm";
import { nonEmptyString } from "@/validation-helpers";
import { Coin } from "@cosmjs/amino";
import { MsgSendEncodeObject } from "@cosmjs/stargate";
import { zodResolver } from "@hookform/resolvers/zod";
import { HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
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
      asset: z
        .custom<IBalanceOption>(() => {
          // TODO: this should be more precise
          return true;
        })
        .nullable(),
    }),
    recipient: nonEmptyString("Address"),
    memo: z.string(),
  })
  .required()
  .refine(
    (data) => {
      if (!data.coin.asset) return true;

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
        asset: null,
      },
      recipient: "",
      memo: "",
    },
    mode: "onTouched",
    resolver: zodResolver(schema),
  });

  const wallet = useCurrentWallet({});
  const balances = useBalances();
  const alert = useAlert();
  const invalidateBalancesQueries = useInvalidateBalancesQueries();

  const send = useMutation({
    mutationFn: async ({ coin, recipient, memo }: FormData) => {
      invariant(wallet, "Wallet not found");
      invariant(coin.asset, "No asset selected");

      const asset = coin.asset;
      const chainId = asset.targetChainId;

      const rawAmount = new BigNumber(coin.amount)
        .multipliedBy(10 ** asset.asset.decimals)
        .toFixed(0, BigNumber.ROUND_DOWN);

      if (isEvmChainId(chainId)) {
        const targetChain = TargetChain.chainId(chainId);
        invariant(targetChain.validateAddress(recipient), "Invalid address");
        const account = await targetChain.localAccountFromWallet(wallet);
        const kernelAccount = await targetChain.kernelAccount(account);
        const callData = HexEncodedStringWithPrefix.parse(
          await kernelAccount.encodeCallData({
            to: recipient,
            data: "0x",
            value: BigInt(rawAmount),
          }),
        );
        const response = await SignAndBroadcastEvm.start({
          callData,
          cancelable: true,
          targetChainId: chainId,
          walletMeta: {
            userEntryAddress: wallet.userEntryAddress,
          },
        });
        await invalidateBalancesQueries(chainId);
        if (response.approved) {
          alert.showSuccess("TX sent");
        }
        return;
      }

      const signer = await CosmosSdkMpcSigner.fromWallet(wallet, chainId);

      const accounts = await signer.getAccounts();
      const firstAccount = accounts[0];
      invariant(firstAccount, "No account found");

      const tokens: Coin[] = [
        {
          amount: rawAmount,
          denom: asset.denom,
        },
      ];

      const message: MsgSendEncodeObject = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          fromAddress: firstAccount.address,
          toAddress: recipient,
          amount: tokens,
        },
      };
      const response = await SignAndBroadcastTransactionUserInteraction.start({
        messages: [message],
        memo,
        cancelable: true,
        targetChainId: chainId,
        walletMeta: {
          userEntryAddress: wallet.userEntryAddress,
        },
      });

      await invalidateBalancesQueries(chainId);
      if (response.approved) {
        const broadcastResult = response.payload;
        if (broadcastResult.success) {
          alert.showSuccess("TX broadcast successfully");
        } else {
          alert.showError(`TX failed: ${broadcastResult.rawLog}`);
        }
      }
    },
    onError(error: Error) {
      alert.showError(`TX failed: ${error.message}`);
    },
  });

  const balance = balances
    .filter((b) => {
      return b.isSuccess;
    })
    .map((b) => {
      return b.data;
    })
    .filter((b): b is AssetWithPrice[] => {
      return Array.isArray(b);
    });

  const withChainId = balance.flat();

  const balanceOptions = withChainId
    .map((b) => {
      const assetData = TargetChain.chainId(b.chainId).assetInfo(b.assetId);
      if (!assetData) return null;

      const amount = new BigNumber(b.rawAmount);
      const decimalAmount = amount.dividedBy(10 ** assetData.decimals);

      const result: IBalanceOption = {
        image: assetData.image ?? undefined,
        targetChainId: b.chainId,
        denom: b.assetId,
        network: TargetChain.chainId(b.chainId).label,
        assetUnit: assetData?.symbol,
        balance: decimalAmount,
        asset: assetData,
      };
      return result;
    })
    .filter((option): option is IBalanceOption => {
      return !!option;
    });

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

    const initialAsset = initialAssetParam ? getInitialAsset() : null;
    if (initialAsset) {
      form.setValue("coin", {
        amount: coin.amount,
        asset: initialAsset,
      });
    }
  }, [balanceOptions, form, params]);

  if (balanceOptions.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className=" text-white">No balances found</p>
      </div>
    );
  }
  const validation = schema.safeParse(form.getValues());
  const issue = validation.error?.issues[0];
  const invalidAddress =
    issue?.message === "Invalid address" &&
    issue.path.length === 0 &&
    issue.code === "custom";
  return (
    <div className="space-y-7 py-4">
      <Controller
        name="recipient"
        control={form.control}
        rules={{ required: true }}
        render={({ field }) => {
          return (
            <Input
              label="Recipient Address"
              labelClassname="bg-background-secondary"
              placeholder="Enter recipient address"
              value={field.value}
              onChange={(recipient) => {
                field.onChange(recipient);
              }}
            />
          );
        }}
      />
      <Controller
        name="coin"
        control={form.control}
        rules={{ required: true }}
        render={({ field }) => {
          const coin = field.value;
          const setCoin = field.onChange;

          return (
            <Input
              label="Amount"
              labelClassname="bg-background-secondary"
              placeholder="0.1"
              value={coin.amount}
              inputClassName="flex-1"
              rightContainerClassName="flex-1"
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
                    ? `${coin.asset.balance.toString()} ${
                        coin.asset.asset.symbol
                      }`
                    : ""}
                </div>
              }
              rightComponent={
                <Dropdown
                  items={balanceOptions}
                  selectedItem={coin.asset}
                  getKey={(item) => {
                    return item.denom;
                  }}
                  itemToString={(item) => {
                    return item ? item.denom : "";
                  }}
                  className="w-full"
                  itemComponent={({ getItemProps, item, isSelected }) => {
                    // TODO: check types here
                    return (
                      <div
                        {...getItemProps({ item })}
                        className={cn(
                          " hover:bg-background-primary-hover flex cursor-pointer flex-row space-x-3 p-3",
                          isSelected && "bg-gray-600 ",
                          item.disabled &&
                            "cursor-not-allowed opacity-50 hover:bg-gray-600",
                        )}
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
                          <div>
                            {`${item.asset.symbol.toUpperCase()} (on ${item.network})`}
                          </div>
                          <div>{item.balance.toString()}</div>
                        </div>
                      </div>
                    );
                  }}
                  onItemSelect={function (item) {
                    setCoin({
                      amount: coin.amount,
                      asset: item,
                    });
                  }}
                  selectedItemComponent={(selected) => {
                    if (!selected.item) {
                      return <div>Select</div>;
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
                          <div>
                            {`${selected.item.asset.symbol.toUpperCase()} (on ${selected.item.network})`}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              }
            >
              <div className="flex gap-3 text-slate-500">
                <span
                  className=" cursor-pointer text-xs hover:text-blue-600"
                  onClick={() => {
                    setCoin({
                      amount:
                        coin.asset?.balance.multipliedBy(0.25).toString() ?? "",
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
                      amount:
                        coin.asset?.balance.multipliedBy(0.5).toString() ?? "",
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
                      amount:
                        coin.asset?.balance.multipliedBy(0.75).toString() ?? "",
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
          );
        }}
      />

      <Controller
        name="memo"
        control={form.control}
        rules={{ required: true }}
        render={({ field }) => {
          return (
            <Input
              label="Memo (optional)"
              labelClassname="bg-background-secondary"
              placeholder="Enter Memo"
              value={field.value}
              onChange={(recipient) => {
                field.onChange(recipient);
              }}
            />
          );
        }}
      />
      <div className="flex justify-between">
        {invalidAddress ? (
          <Text className="ml-2 text-red-600">
            Assets can only be sent to the same chain
          </Text>
        ) : (
          <div />
        )}
        <Button
          className="block w-44"
          disabled={!form.formState.isValid || send.isPending}
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
