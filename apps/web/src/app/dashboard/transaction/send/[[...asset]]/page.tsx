"use client";

import { Button, IBalanceOption, Text } from "@/components";
import { InfoIcon } from "@/components/info-icon";
import { HomeChain } from "@/home-chain";
import { useAlert } from "@/hooks/alert";
import {
  PrettyCaip19Asset,
  useBalances,
  useInvalidateBalancesQueries,
} from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { cn } from "@/lib/utils";
import { TargetChain } from "@/target-chain";
import { isCosmosChainId } from "@/target-chain/cosmos/chains";
import { CosmosMpcSigner } from "@/target-chain/cosmos/mpc-signer";
import {
  EvmUserOperationCalls,
  serializeUserOperationCalls,
} from "@/target-chain/eip-155";
import { isEip155ChainId } from "@/target-chain/eip-155/chains";
import { isSecretChainId } from "@/target-chain/secret/chains";
import { SecretMpcSigner } from "@/target-chain/secret/mpc-signer";
import { isSolanaChainId } from "@/target-chain/solana/chains";
import { CustomDropdown as Dropdown } from "@/ui/dropdown";
import { Input } from "@/ui/input";
import { SignAndBroadcastEvm } from "@/user-interactions/sign-and-broadcast/evm";
import { SignAndBroadcastSvm } from "@/user-interactions/sign-and-broadcast/svm";
import { urlDecodeCatchAllParam } from "@/util/url-decode-catch-all-param";
import { nonEmptyString } from "@/validation-helpers";
import { Coin } from "@cosmjs/amino";
import { MsgExecuteContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { MsgSendEncodeObject } from "@cosmjs/stargate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Encoding } from "@obi-wallet/encoding";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import { serialize } from "@obi-wallet/sdk-json";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Controller, useForm } from "react-hook-form";
import { MsgExecuteContract, MsgSend } from "secretjs";
import invariant from "tiny-invariant";
import { encodeFunctionData, erc20Abi } from "viem";
import { z } from "zod";

const schema = z
  .object({
    coin: z.object({
      amount: z
        .string()
        .transform((amount) => {
          return amount.trim().replace(",", ".");
        })
        .refine((amount) => {
          return new BigNumber(amount).isGreaterThan(0);
        }),
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
      } catch {
        return false;
      }
    },
    {
      message: "Invalid address",
    },
  );
type FormData = z.infer<typeof schema>;

export default observer<{ params: Promise<{ asset?: string[] }> }>(
  function Send(props) {
    const params = use(props.params);
    const balances = useBalances();
    const balance = balances
      .filter((b) => {
        return b.isSuccess;
      })
      .map((b) => {
        return b.data;
      })
      .filter((b): b is PrettyCaip19Asset[] => {
        return !!b;
      });

    const withChainId = balance.flat();

    const balanceOptions = withChainId
      .map((b) => {
        const { chainId } = parseCaip19AssetId(b.assetId);
        if (!b.assetInfo) return null;

        invariant(
          isCosmosChainId(chainId) ||
            isEip155ChainId(chainId) ||
            isSecretChainId(chainId) ||
            isSolanaChainId(chainId),
          "Expected valid targetChainId",
        );

        const result: IBalanceOption = {
          image: b.assetInfo.image ?? undefined,
          targetChainId: chainId,
          denom: b.assetId,
          network: TargetChain.chainId(chainId).label,
          assetUnit: b.assetInfo.symbol,
          balance: new BigNumber(b.prettyAmount),
          asset: b,
          assetInfo: b.assetInfo,
        };
        return result;
      })
      .filter((option): option is IBalanceOption => {
        return !!option;
      });

    const getAsset = () => {
      const initialAssetParam = urlDecodeCatchAllParam(params.asset ?? []);
      if (initialAssetParam) {
        const balanceOption = balanceOptions.find((balance) => {
          return balance.asset.assetId === initialAssetParam;
        });
        if (balanceOption) {
          return balanceOption;
        }
      }

      return balanceOptions[0];
    };

    const asset = getAsset();

    if (asset) {
      return <SendInner asset={asset} balanceOptions={balanceOptions} />;
    }

    return null;
  },
);

const SendInner = observer<{
  asset: IBalanceOption;
  balanceOptions: IBalanceOption[];
}>(function Send({ asset, balanceOptions }) {
  const router = useRouter();
  const form = useForm<FormData>({
    defaultValues: {
      coin: {
        amount: "",
        asset,
      },
      recipient: "",
      memo: "",
    },
    mode: "onTouched",
    resolver: zodResolver(schema),
  });

  const wallet = useCurrentWallet();
  const alert = useAlert();
  const invalidateBalancesQueries = useInvalidateBalancesQueries();

  const send = useMutation({
    mutationFn: async ({ coin, recipient, memo }: FormData) => {
      invariant(wallet, "Wallet not found");
      invariant(coin.asset, "No asset selected");

      const asset = coin.asset;
      const chainId = asset.targetChainId;

      const rawAmount = new BigNumber(coin.amount)
        .multipliedBy(10 ** asset.assetInfo.decimals)
        .toFixed(0, BigNumber.ROUND_DOWN);

      if (isEip155ChainId(chainId)) {
        const targetChain = TargetChain.chainId(chainId);
        invariant(targetChain.validateAddress(recipient), "Invalid address");

        const { namespace, reference } = parseCaip19AssetId(asset.denom);

        const getCalls = (): EvmUserOperationCalls | null => {
          if (namespace === "native") {
            return [
              {
                to: recipient,
                data: "0x",
                value: BigInt(rawAmount),
              },
            ];
          }

          if (namespace === "erc20") {
            if (!targetChain.validateAddress(reference)) {
              return null;
            }

            return [
              {
                to: reference,
                data: encodeFunctionData({
                  abi: erc20Abi,
                  functionName: "transfer",
                  args: [recipient, BigInt(rawAmount)],
                }),
                value: 0n,
              },
            ];
          }

          return null;
        };

        const calls = getCalls();

        if (!calls) {
          alert.showError("Unsupported asset");
          return;
        }

        const response = await SignAndBroadcastEvm.start({
          calls: serializeUserOperationCalls(calls),
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

      if (isSecretChainId(chainId)) {
        const targetChain = TargetChain.chainId(chainId);
        const signer = await SecretMpcSigner.fromWallet(wallet, chainId);

        const accounts = await signer.getAccounts();
        const firstAccount = accounts[0];
        invariant(firstAccount, "No account found");

        const denom = targetChain.caip19AssetIdToDenom(asset.denom);

        invariant(denom, "Expected valid denom");

        const getMessage = () => {
          const { namespace, reference } = parseCaip19AssetId(asset.denom);
          switch (namespace) {
            case "native":
            case "factory":
            case "ibc": {
              return new MsgSend({
                from_address: firstAccount.address,
                to_address: recipient,
                amount: [
                  {
                    amount: rawAmount,
                    denom,
                  },
                ],
              });
            }

            case "cw20":
            case "snip20":
              return new MsgExecuteContract({
                sender: firstAccount.address,
                contract_address: reference,
                msg: {
                  transfer: {
                    recipient: recipient,
                    amount: rawAmount,
                  },
                },
              });
          }
        };

        const message = getMessage();

        if (!message) {
          alert.showError("Unsupported asset");
          return;
        }

        const response = await SignAndBroadcastTransactionUserInteraction.start(
          {
            messages: [message],
            memo,
            cancelable: true,
            targetChainId: chainId,
            walletMeta: {
              userEntryAddress: wallet.userEntryAddress,
            },
          },
        );

        await invalidateBalancesQueries(chainId);
        if (response.approved) {
          const broadcastResult = response.payload;
          if (broadcastResult.success) {
            alert.showSuccess("TX broadcast successfully");
          } else {
            alert.showError(`TX failed: ${broadcastResult.rawLog}`);
          }
        }
        return;
      }

      if (isSolanaChainId(chainId)) {
        const targetChain = TargetChain.chainId(chainId);
        const publicKeys = await HomeChain.chainId(
          wallet.homeChainId,
        ).publicKeys(wallet.userEntryAddress);
        const response = await SignAndBroadcastSvm.start({
          targetChainId: chainId,
          cancelable: true,
          walletMeta: {
            userEntryAddress: wallet.userEntryAddress,
          },
          message: {
            fromAddress: await targetChain.obiAccountAddress(publicKeys),
            toAddress: recipient,
            id: coin.asset.asset.assetId,
            rawAmount,
          },
        });

        await invalidateBalancesQueries(chainId);
        if (response.approved) {
          alert.showSuccess("TX sent");
        }
        return;
      }

      const targetChain = TargetChain.chainId(chainId);
      const signer = await CosmosMpcSigner.fromWallet(wallet, chainId);

      const accounts = await signer.getAccounts();
      const firstAccount = accounts[0];
      invariant(firstAccount, "No account found");

      const denom = targetChain.caip19AssetIdToDenom(asset.denom);

      invariant(denom, "Expected valid denom");

      const getMessage = () => {
        const { namespace, reference } = parseCaip19AssetId(asset.denom);
        switch (namespace) {
          case "native":
          case "factory":
          case "ibc": {
            const tokens: Coin[] = [
              {
                amount: rawAmount,
                denom,
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
            return message;
          }

          case "cw20": {
            const transferMsg = {
              transfer: {
                recipient: recipient,
                amount: rawAmount,
              },
            };

            const message: MsgExecuteContractEncodeObject = {
              typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
              value: {
                sender: firstAccount.address,
                contract: reference,
                msg: Encoding.fromUtf8(serialize(transferMsg)).toBytes(),
              },
            };
            return message;
          }
        }
      };

      const message = getMessage();

      if (!message) {
        alert.showError("Unsupported asset");
        return;
      }

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

  if (balanceOptions.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-white">No balances found</p>
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
    <div className="flex flex-col gap-4 p-2.5">
      <Controller
        name="recipient"
        control={form.control}
        rules={{ required: true }}
        render={({ field }) => {
          return (
            <div className="flex items-center gap-2">
              <Input
                labelClassname="bg-background-secondary"
                className="h-[48px] w-full rounded-[5px] border border-[#32c9af]"
                placeholder="Enter Recipient Address"
                value={field.value}
                onChange={(recipient) => {
                  field.onChange(recipient);
                }}
              />
              <InfoIcon topicId="recipient_address_info" />
            </div>
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
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Dropdown
                  className="h-[48px] w-full rounded-[5px] border border-[#32c9af]"
                  items={balanceOptions}
                  selectedItem={coin.asset}
                  getKey={(item) => {
                    return item.denom;
                  }}
                  itemToString={(item) => {
                    return item ? item.denom : "";
                  }}
                  onItemSelect={function (item) {
                    router.replace(
                      `/dashboard/transaction/send/${encodeURIComponent(item.denom)}`,
                    );
                  }}
                  itemComponent={({ getItemProps, item, isSelected }) => {
                    return (
                      <div
                        {...getItemProps({ item })}
                        className={cn(
                          "hover:bg-background-primary-hover flex cursor-pointer flex-row space-x-3 p-3",
                          isSelected && "bg-gray-600",
                          item.disabled &&
                            "cursor-not-allowed opacity-50 hover:bg-gray-600",
                        )}
                      >
                        <div className="flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.network}
                            width={24}
                            height={24}
                          />
                        </div>
                        <div className="text-white">
                          <div>
                            {`${item.assetInfo.symbol.toUpperCase()} (on ${item.network})`}
                          </div>
                          <div>{item.balance.toString()}</div>
                        </div>
                      </div>
                    );
                  }}
                  selectedItemComponent={(selected) => {
                    if (!selected.item) {
                      return <div>Select Asset</div>;
                    }

                    return (
                      <div className="flex w-full cursor-pointer flex-row gap-5 font-normal">
                        <div className="flex items-center justify-between">
                          <img
                            src={selected.item.image}
                            alt={selected.item.network}
                            className="h-6 w-6"
                          />
                        </div>
                        <div className="text-md flex flex-col items-end font-normal">
                          <div>
                            {`${selected.item.assetInfo.symbol.toUpperCase()} (on ${selected.item.network})`}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <InfoIcon topicId="send_chain_asset_info" />
              </div>

              <div className="flex items-center gap-2">
                <Input
                  labelClassname="bg-background-secondary"
                  className="w-full rounded-[5px] border border-[#32c9af] p-2.5"
                  placeholder="Enter Amount"
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
                        "cursor-pointer text-slate-500 hover:text-blue-600",
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
                            coin.asset.assetInfo.symbol
                          }`
                        : ""}
                    </div>
                  }
                >
                  <div className="mt-2 flex gap-2.5">
                    {[25, 50, 75, 100].map((percent) => {
                      return (
                        <Button
                          key={percent}
                          onClick={() => {
                            const amount =
                              percent === 100
                                ? (coin.asset?.balance.toString() ?? "")
                                : (coin.asset?.balance
                                    .multipliedBy(percent / 100)
                                    .toString() ?? "");
                            setCoin({
                              amount,
                              asset: coin.asset,
                            });
                          }}
                          className="rounded-[5px] bg-transparent p-2.5"
                        >
                          <Text className="font-['Roboto Mono'] text-sm text-white">
                            {percent}%
                          </Text>
                        </Button>
                      );
                    })}
                  </div>
                </Input>
                <InfoIcon topicId="send_amount_info" />
              </div>
            </div>
          );
        }}
      />
      <Controller
        name="memo"
        control={form.control}
        rules={{ required: true }}
        render={({ field }) => {
          return (
            <div className="flex items-center gap-2">
              <Input
                labelClassname="bg-background-secondary"
                className="h-[48px] w-full rounded-[5px] border border-[#32c9af]"
                placeholder="Memo (optional)"
                value={field.value}
                onChange={(memo) => {
                  field.onChange(memo);
                }}
              />
              <InfoIcon topicId="memo_field_info" />
            </div>
          );
        }}
      />
      <div className="mt-4 flex justify-between">
        {invalidAddress ? (
          <Text className="ml-2 text-red-600">
            Assets can only be sent to the same chain
          </Text>
        ) : (
          <div />
        )}
        <Button
          className="w-full rounded-[5px] bg-[#32c9af] p-2.5"
          disabled={!form.formState.isValid || send.isPending}
          onClick={form.handleSubmit((data) => {
            send.mutate(data);
          })}
        >
          <Text className="font-['Roboto Mono'] text-lg font-normal text-[#070707]">
            Next
          </Text>
        </Button>
      </div>
    </div>
  );
});
