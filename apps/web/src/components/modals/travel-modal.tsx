"use client";

import { fromAssets, ToAsset, toAssets } from "@/dashboard/assets";
import { useAlert } from "@/hooks/alert";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { cn, fromChains, toChains } from "@/lib/utils";
import { TargetChain } from "@/target-chain";
import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { CustomDropdown as Dropdown } from "@/ui/dropdown";
import { Input } from "@/ui/input";
import { SendingAnimation } from "@/user-interactions/approve-messages/sending-animation";
import { nonEmptyString } from "@/validation-helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@obi-wallet/headless-ui";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { skipToken } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import copy from "copy-to-clipboard";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FaArrowRight,
  FaCheck,
  FaExclamation,
  FaSpinner,
} from "react-icons/fa6";
import { z } from "zod";

import { Box, Button, Text } from "..";
import { Divider } from "../divider";
import { IAssetOption } from "../dropdown";

interface ToleranceProps {
  onChange: (value: number | undefined) => void;
  value: number | undefined;
  onBlur: () => void;
  errorMessage?: string;
}

interface TravelModalProps {
  targetAsset: string;
  onDismiss?: () => void;
  modal?: boolean;
  cancelLabel?: string;
}

type ErrorsObject = Record<string, { message: string; type: string }>;

interface SingleError {
  message: string;
  type: string;
}

type Errors = ErrorsObject | SingleError;

const schema = z.object({
  fromChain: nonEmptyString("FromChain"),
  toChain: nonEmptyString("ToChain"),
  fromAsset: z
    .object({
      // amount should be undefined or number
      amount: z
        .string()
        .refine(nonEmptyString, "Amount is required")
        .refine((str) => {
          const num = new BigNumber(str);
          return num.gte(0);
        }, "Amount is invalid"),
      asset: z.string().refine(nonEmptyString, "Asset is required"),
    })
    .refine(
      (data) => {
        const { amount, asset } = data;
        const num = new BigNumber(amount);
        // Define the minimum amount based on whether the asset contains "ETHEREUM"
        const minAmount = asset.toUpperCase().includes("ETHEREUM")
          ? 0.01
          : 0.005;
        return num.isGreaterThanOrEqualTo(minAmount);
      },
      (data) => {
        const isEth = data.asset.toUpperCase().includes("ETHEREUM");
        const minAmount = isEth ? "0.01" : "0.005";
        return {
          message: `Min ${minAmount} for this chain`,
        };
      },
    ),

  toAsset: z.string().refine(nonEmptyString, "Asset is required"),
  slippage: z
    .number()
    .min(1, "Slippage must be greater than 1")
    .max(100, "Slippage must be less than 100"),
});

type FormData = z.infer<typeof schema>;

export const TravelModal = observer<TravelModalProps>(function TravelModal({
  targetAsset,
  onDismiss,
  modal,
  cancelLabel = "Accept",
}) {
  const publicKey = usePublicKey();
  const currentWallet = useCurrentWallet({ redirectIfFound: false });
  const alert = useAlert();

  const getChainFromAsset = () => {
    if (targetAsset === "usdc") {
      return CosmosSdkChainId.Neutron;
    } else {
      return toAssets[targetAsset]?.chainId ?? "";
    }
  };

  const { control, watch, setValue, formState } = useForm<FormData>({
    defaultValues: {
      fromChain: fromChains[0]?.chainId ?? "",
      fromAsset: {
        amount: "",
        asset: "eth",
      },
      toChain: getChainFromAsset(),
      toAsset: targetAsset,
      slippage: 1,
    },
    mode: "onTouched",
    resolver: zodResolver(schema),
  });
  const fromAssetValue = watch("fromAsset");
  const toAssetValue = watch("toAsset");
  const fromChainValue = watch("fromChain");
  const toChainValue = watch("toChain");
  const slippage = watch("slippage");

  const formData = {
    fromAsset: fromAssetValue,
    toAsset: toAssetValue,
    fromChain: fromChainValue,
    toChain: toChainValue,
    slippage,
  };
  const simulateQuery = useQuery({
    queryKey: ["travel-modal-simulate", { formData }],
    queryFn:
      formData.fromAsset.amount &&
      formData.fromAsset.asset &&
      formData.toAsset &&
      formData.toChain &&
      formData.fromChain &&
      publicKey
        ? async () => {
            if (BigNumber(formData.fromAsset.amount).lt(0.005)) return null;

            try {
              const simulation = await simulateTravel(formData, publicKey);
              if (!simulation) return null;

              if (
                typeof simulation.skip_simulation !== "string" &&
                simulation.skip_simulation.msgs.length > 0
              ) {
                const skipMsg = JSON.parse(
                  simulation.skip_simulation.msgs[0].multi_chain_msg.msg,
                );
                const skipAmount =
                  skipMsg.msg.swap_and_action.min_asset.native.amount;
                const toAssetDecimals =
                  toAssets[formData.toAsset]?.decimals ?? 6;
                return {
                  amount: new BigNumber(skipAmount)
                    .dividedBy(10 ** toAssetDecimals)
                    .toString(),
                  depositAddress: simulation.deposit_address,
                };
              }

              const toAssetDecimals = toAssets[formData.toAsset]?.decimals ?? 6;
              return {
                depositAddress: simulation.deposit_address,
                amount: new BigNumber(
                  simulation.squid_simulation.route.estimate.toAmount,
                )
                  .dividedBy(10 ** toAssetDecimals)
                  .toString(),
              };
            } catch (e) {
              console.error(e);
              return null;
            }
          }
        : skipToken,
  });
  const simulating = simulateQuery.isFetching;
  const depositAmount = simulateQuery.data?.amount ?? "";
  const depositAddress = simulateQuery.data?.depositAddress;

  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const [addressCopied, setAddressCopied] = useState<boolean>(false);

  const executeTx = async () => {
    // get the deposit data
    const from = fromAssets[fromAssetValue?.asset ?? ""];
    setLoading(true);
    const ethereum = window.ethereum;
    if (!ethereum) {
      console.error("Ethereum provider not found");
      return;
    }
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      const walletChainId = await ethereum.request({ method: "eth_chainId" });
      const chainId = fromChainValue;

      // cast chainId number to hex
      const hexChainId = "0x" + Number(chainId).toString(16);

      // check if the account is connected to the desired
      if (walletChainId !== chainId) {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChainId }],
        });
      }
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      const roundedAmount = Number(
        Number(fromAssetValue?.amount).toFixed(from?.decimals) ?? 0,
      );

      const amount = parseUnits(roundedAmount.toString(), from?.decimals);
      const fromAddress = from?.address;

      if (fromAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        //transfer the asset to the deposit address using native transfer
        const tx = {
          to: depositAddress,
          value: amount.toString(),
        };

        const transaction = await signer.sendTransaction(tx);
        console.log("Transaction hash:", transaction.hash);
        alert.showSuccess("Transaction sent!");
        router.push("/dashboard");
        return;
      } else {
        const abi = ["function transfer(address to, uint amount)"]; // Simplified ABI for transfer function
        const contract = new Contract(fromAddress || "", abi, signer);

        if (typeof contract.transfer !== "function") {
          console.error("Transfer method does not exist on the contract");
          return;
        }
        // Send the transaction
        await contract?.transfer(depositAddress, amount);

        setLoading(false);
        alert.showSuccess("Transaction sent!");
        router.push("/dashboard");
      }
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const error = e as Error;
      setLoading(false);

      alert.showError(error.message);
      console.error(e);
    }
  };

  const getFromChainOptions = () => {
    return fromChains.map((chain) => {
      return {
        label: chain.label,
        value: chain.chainId,
        image: chain.image,
        disabled: chain.disabled,
      };
    });
  };
  const getToChainOptions = () => {
    return toChains.map((chain) => {
      const targetChain = TargetChain.chainId(chain);
      return {
        label: targetChain.label ?? "",
        value: chain,
        image: targetChain.image ?? "",
        disabled: targetChain.disabled,
      };
    });
  };

  const getAssetOptions = (assets: Record<string, ToAsset>): IAssetOption[] => {
    if (assets === undefined) return [];

    const chainAssets = Object.entries(assets)
      .filter(([_, asset]) => {
        if (asset.chainId === toChainValue) {
          return true;
        }
        if (
          asset.denom.includes("ibc/") &&
          !["osmosis-1", "stargaze-1"].includes(toChainValue)
        ) {
          return true;
        }
        return false;
      })
      .reduce<Record<string, ToAsset>>((acc, [key, asset]) => {
        return {
          ...acc,
          [key]: asset,
        };
      }, {});

    return Object.entries(chainAssets).map(
      ([key, asset]: [string, ToAsset]): IAssetOption => {
        return {
          label: asset?.label ?? "",
          image: asset?.image ?? "",
          value: key,
          disabled: asset.disabled,
        };
      },
    );
  };

  const fromChainOptions = getFromChainOptions();
  const toChainOptions = getToChainOptions();

  return (
    <div
      className={cn(
        "top-0 flex  h-full w-full flex-1 justify-center rounded-md bg-black/30 backdrop-blur-sm",
        modal ? "absolute" : "relative",
      )}
    >
      <Box
        className={cn(
          "relative   h-fit w-full sm:shadow-lg sm:shadow-neutral-600 md:m-10 md:max-w-[560px]",
          "pt-10 ",
        )}
      >
        <div className="space-y-4">
          <Text size="xl">Obi Fast Travel</Text>
          <Text size="sm" className=" leading-5">
            Deposit assets below from an external account to receive them in
            your Obi account.
          </Text>
          <Divider />
          <span className="mt-7 text-sm">Networks</span>

          <div className="relative z-30 flex flex-row">
            <Controller
              name="fromChain"
              control={control}
              render={({ field }) => {
                return (
                  <Dropdown
                    itemToString={(item) => {
                      return item?.label ?? "";
                    }}
                    items={fromChainOptions}
                    selectedItem={
                      fromChainOptions.find((item) => {
                        return item.value === fromChainValue;
                      }) ??
                      fromChainOptions[0] ??
                      null
                    }
                    getKey={(item) => {
                      return item.label;
                    }}
                    className="h-full w-full"
                    itemComponent={({ getItemProps, item, isSelected }) => {
                      const {
                        onClick,
                        onMouseDown,
                        onMouseMove,
                        ...itemProps
                      } = getItemProps({ item });

                      return (
                        <div
                          {...itemProps}
                          {...(!item.disabled && {
                            onClick,
                            onMouseDown,
                            onMouseMove,
                          })}
                          className={cn(
                            " hover:bg-background-primary-hover flex cursor-pointer flex-row space-x-3 p-3",
                            isSelected && "bg-gray-600 ",
                            item.disabled &&
                              "cursor-not-allowed opacity-50 hover:bg-gray-600",
                          )}
                        >
                          <div className="flex items-center justify-center">
                            <img
                              src={item.image}
                              alt={item.label}
                              width={24}
                              height={24}
                            />
                          </div>
                          <div className="text-white">
                            <div className="uppercase">{item.label}</div>
                          </div>
                        </div>
                      );
                    }}
                    onItemSelect={(item) => {
                      field.onChange(item.value);
                    }}
                    selectedItemClassname="bg-black/30 h-full"
                    selectedItemComponent={(selected) => {
                      if (!selected.item) {
                        return <div>Select</div>;
                      }
                      return (
                        <div className="flex w-full cursor-pointer flex-col gap-2 font-normal">
                          <div className="flex items-center justify-center ">
                            <img
                              src={selected.item.image}
                              alt={selected.item.label}
                              className="h-8 w-8"
                            />
                          </div>
                          <div className="flex flex-col items-center justify-center text-sm font-normal max-sm:text-xs">
                            <div className=" uppercase">
                              {selected.item.label}
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                );
              }}
            />
            <div className=" flex items-center justify-center p-2  sm:p-5">
              <FaArrowRight className="m-auto text-white" />
            </div>
            <Controller
              name="toChain"
              control={control}
              render={({ field }) => {
                return (
                  <Dropdown
                    itemToString={(item) => {
                      return item?.label ?? "";
                    }}
                    items={toChainOptions}
                    selectedItem={
                      toChainOptions.find((item) => {
                        return item.value === field.value;
                      }) ??
                      toChainOptions[0] ??
                      null
                    }
                    getKey={(item) => {
                      return item.label;
                    }}
                    className="w-full"
                    itemComponent={({ getItemProps, item, isSelected }) => {
                      const {
                        onClick,
                        onMouseDown,
                        onMouseMove,
                        ...itemProps
                      } = getItemProps({ item });

                      return (
                        <div
                          {...itemProps}
                          {...(!item.disabled && {
                            onClick,
                            onMouseDown,
                            onMouseMove,
                          })}
                          className={cn(
                            "hover:bg-background-primary-hover flex cursor-pointer flex-row space-x-3 p-3",
                            isSelected && "bg-gray-600",
                            item.disabled &&
                              "cursor-not-allowed opacity-50 hover:bg-gray-600",
                          )}
                        >
                          <div className="flex items-center justify-center ">
                            <img
                              src={item.image}
                              alt={item.label}
                              width={24}
                              height={24}
                            />
                          </div>
                          <div className="text-white">
                            <div className=" uppercase">{item.label}</div>
                          </div>
                        </div>
                      );
                    }}
                    onItemSelect={(item) => {
                      setValue("toAsset", "", {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      field.onChange(item.value);
                    }}
                    selectedItemClassname="bg-black/30 h-full"
                    selectedItemComponent={(selected) => {
                      if (!selected.item) {
                        return <div>Select</div>;
                      }
                      return (
                        <div className="flex w-full cursor-pointer flex-col gap-2 font-normal">
                          <div className="flex items-center justify-center ">
                            <img
                              src={selected.item.image}
                              alt={selected.item.label}
                              className="h-8 w-8"
                            />
                          </div>
                          <div className="flex flex-col items-center justify-center text-sm font-normal max-sm:text-xs">
                            <div className="uppercase">
                              {selected.item.label}
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                );
              }}
            />
          </div>

          <Controller
            name="fromAsset"
            control={control}
            render={({ field, fieldState }) => {
              // TODO: Here's something wrong with the types, according to react-hook-form this should always be a single message, review
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              const errors = fieldState.error as Errors | undefined;

              return (
                <Input
                  label="Deposit"
                  labelClassname="bg-background-secondary"
                  onChange={(value) => {
                    field.onChange({
                      asset: field.value.asset,
                      amount: value,
                    });
                  }}
                  className={cn(
                    "z-20",
                    "relative",
                    fieldState.error &&
                      " border-red-500 focus-within:border-red-500",
                  )}
                  onBlur={field.onBlur}
                  value={field.value.amount}
                  placeholder="0.1"
                  inputClassName="flex-4 md:flex-1 sm:flex-6"
                  rightContainerClassName=" flex-6 md:flex-1 sm:flex-4"
                  rightComponent={
                    <div className="flex w-full   flex-row  gap-5 rounded bg-black/30 p-3 font-normal">
                      <div className="flex items-center   justify-between">
                        <img
                          src={fromAssets[field.value.asset]?.image}
                          alt={fromAssets[field.value.asset]?.label}
                          className="h-6 w-6"
                        />
                      </div>
                      <div className="flex flex-col items-end text-sm font-normal">
                        <div className=" uppercase">
                          {fromAssets[field.value.asset]?.label}
                        </div>
                      </div>
                    </div>
                  }
                >
                  {errors && <ErrorsComponent errors={errors} />}
                </Input>
              );
            }}
          />
          <Controller
            name="toAsset"
            control={control}
            render={({ field, fieldState }) => {
              const options = getAssetOptions(toAssets);

              return (
                <Input
                  label="Receive (estimated)"
                  labelClassname="bg-background-secondary"
                  className={cn(
                    "z-10",
                    "relative",
                    fieldState.error &&
                      " border-red-500 focus-within:border-red-500",
                  )}
                  onBlur={field.onBlur}
                  value={depositAmount}
                  inputDisabled
                  placeholder={simulating ? "Simulating..." : "0.1"}
                  inputClassName="flex-4 md:flex-1 sm:flex-6 "
                  rightContainerClassName=" flex-6 md:flex-1 sm:flex-4"
                  rightComponent={
                    <Dropdown
                      itemToString={(item) => {
                        return item?.label ?? "";
                      }}
                      items={options}
                      selectedItem={
                        (field.value !== ""
                          ? options.find((item) => {
                              return item.value === field.value;
                            })
                          : null) ?? null
                      }
                      getKey={(item) => {
                        return item.label;
                      }}
                      className="w-full"
                      itemComponent={({ getItemProps, item, isSelected }) => {
                        const {
                          onClick,
                          onMouseDown,
                          onMouseMove,
                          ...itemProps
                        } = getItemProps({ item });

                        return (
                          <div
                            {...itemProps}
                            {...(!item.disabled && {
                              onClick,
                              onMouseDown,
                              onMouseMove,
                            })}
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
                                alt={item.label}
                                width={24}
                                height={24}
                              />
                            </div>
                            <div className="text-white">
                              <div className=" uppercase">{item.label}</div>
                            </div>
                          </div>
                        );
                      }}
                      onItemSelect={(item) => {
                        field.onChange(item.value);
                        // void handleAssetChange();
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
                                alt={selected.item.label}
                                className="h-6 w-6"
                              />
                            </div>
                            <div className="flex flex-col items-end text-sm font-normal">
                              <div className=" uppercase">
                                {selected.item.label}
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                  }
                />
              );
            }}
          />

          <Controller
            name="slippage"
            control={control}
            render={({ field, fieldState }) => {
              return (
                <ToleranceSetting
                  value={field.value}
                  onChange={(attr) => {
                    field.onChange(attr);
                  }}
                  onBlur={field.onBlur}
                  errorMessage={fieldState.error?.message}
                />
              );
            }}
          />

          <Divider />
          {depositAddress && (
            <>
              <div
                className={cn(
                  "flex-column  flex  bg-black/30 bg-opacity-10 p-5",
                  addressCopied &&
                    "rounded-md  border-2 shadow-md shadow-white",
                )}
              >
                <div
                  className={cn(
                    "mr-5 flex aspect-square h-10 w-10 items-center justify-center rounded-full border border-white p-2",

                    addressCopied && "border-2",
                  )}
                >
                  <FaExclamation className="m-auto text-white " />
                </div>
                <Text size={addressCopied ? "md" : "sm"} className=" leading-5">
                  Execute with Metamask or deposit to the address shown below.
                  You may close this dialogue after depositing.
                </Text>
              </div>
            </>
          )}
          {depositAddress ? (
            <AddressComponent
              address={depositAddress}
              onCopy={() => {
                setAddressCopied(true);
              }}
            />
          ) : null}

          <div className="mt-8 flex justify-between">
            <Button
              className="block w-44"
              variant="outline"
              onClick={onDismiss}
            >
              {cancelLabel}
            </Button>

            {formState.isValid && window.ethereum && (
              <Button className="block w-44" onClick={executeTx}>
                Use Metamask
              </Button>
            )}
          </div>
        </div>
        {loading && (
          <SendingAnimation className="z-30 -ml-4" text="Check extension" />
        )}
      </Box>

      {/* add a loader spinner */}
      {!currentWallet && (
        <div className="absolute top-0 z-30 flex h-full w-full flex-col items-center justify-center rounded-md bg-black/30 text-white backdrop-blur-sm">
          <FaSpinner className=" animate-spin text-2xl" />
          Loading
        </div>
      )}
    </div>
  );
});

function ToleranceSetting({
  value,
  onBlur,
  onChange,
  errorMessage,
}: ToleranceProps) {
  const tolerances = [1, 2];
  const [text, setText] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  // we need to trigger an onChange event from the input so we can trigger the validation
  // this is because we are using a custom input and not the one from react-hook-form
  // so we need to trigger the validation manually
  useEffect(() => {
    onChange(Number(text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  useEffect(() => {
    if (value && !isNaN(Number(value))) {
      setText(value.toString());
    }

    onBlur();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const renderErrorMessage = (message: string) => {
    if (message.includes("Expected number")) {
      return "Invalid number";
    }
    return message;
  };

  return (
    <div className="space-y-2">
      <Text color="zinc" size="xs">
        Slippage Tolerance
      </Text>
      <div className="mb-10  flex flex-row space-x-3">
        {tolerances.map((tolerance) => {
          return (
            <Box
              key={`asset-${tolerance}%`}
              className={cn(
                "w-17 flex h-9 flex-row items-center space-x-3 text-center",
                "cursor-pointer",
                value === tolerance ? "bg-background-primary" : "bg-gray-700",
              )}
              onClick={() => {
                return setText(tolerance.toString());
              }}
            >
              <Text>{tolerance}%</Text>
            </Box>
          );
        })}
        <Box
          key="asset-custom%"
          className={cn(
            "flex h-9 w-20 flex-row items-center space-x-3 text-center",

            "bg-black/30",
            // border styles on focus (its an input container)
            " focus-within:ring-background-primary-active focus-within:ring-1",
            // if toleranceNumber is not 1 or 2 then we are in custom mode and we need to show the border
            !tolerances.includes(Number(text) || 0) &&
              "ring-background-primary-active ring-2",
            "text-white",
          )}
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onBlur={onBlur}
            className={cn(
              "w-10 bg-transparent text-center",
              // avoid showing the up and down arrows
              "[-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
              // get rid of custom styles on focus
              "focus:outline-none",
            )}
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
          %
        </Box>
        {errorMessage && (
          <Text color="red" size="xs">
            {renderErrorMessage(errorMessage)}
          </Text>
        )}
      </div>
    </div>
  );
}

function AddressComponent({
  address,
  onCopy,
}: {
  address: string;
  onCopy?: () => void;
}) {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <div className="font-size-[16px] mt-10">
      <Text color="zinc" size="xs">
        Deposit Address
      </Text>
      <div
        className={cn(
          "mt-2  rounded-xl bg-black/30 p-3 text-center",
          address && "cursor-pointer hover:bg-white/10 ",
        )}
        onClick={() => {
          if (!address) return;
          // copy to clipboard
          copy(address);
          setIsCopied(true);
          onCopy && onCopy();

          setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        }}
      >
        <div className="relative">
          <Text className="flex  items-center justify-center text-sm">
            {address}
          </Text>
          <div className="mt-2 text-xs font-medium uppercase text-blue-600">
            Click to copy
          </div>
          {isCopied && (
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-4 rounded-md bg-gray-500 px-4 py-2 text-center text-white">
              <span className=" text-green-500">
                <FaCheck />
              </span>
              <p>Copied</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorsComponent({ errors }: { errors: Errors }) {
  const renderErrorMessage = () => {
    function isSingle(e: SingleError | ErrorsObject): e is SingleError {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return (e as SingleError).message !== undefined;
    }

    if (!errors) return;
    if (isSingle(errors)) {
      return errors.message;
    } else {
      if (errors?.amount?.message) {
        if (errors?.amount?.message === "Required") return "Amount is required";
        return errors?.amount?.message;
      }
      if (errors?.asset?.message) {
        return `Asset ${errors?.asset?.message}`;
      }
    }
  };
  return (
    <div className=" absolute bottom-6 h-1 w-full  text-sm  text-red-800">
      {renderErrorMessage()}
    </div>
  );
}

const simulateTravel = async (
  data: FormData,
  publicKey: Secp256k1PublicKey,
) => {
  const requestURL = `${process.env.NEXT_PUBLIC_FAST_TRAVEL_API_URL}/api/swap/simulate`;
  const toAsset = toAssets[data.toAsset];
  const fromAsset = fromAssets[data.fromAsset.asset];
  const fromAmount = parseUnits(
    new BigNumber(data.fromAsset?.amount).toString(),
    fromAsset?.decimals,
  ).toString();
  const targetChain = TargetChain.chainId(data.toChain);
  const toAddress = await targetChain.obiAccountAddress(publicKey);
  const requestData = {
    slippage: data.slippage.toString(),
    from: {
      address: "0x337bd07492342e6148212b0dab1bce90e9433e7b",
      chainId: data.fromChain,
      asset: fromAsset?.address,
      amount: fromAmount,
    },
    to: {
      chainId: data.toChain,
      asset: toAsset?.denom,
      address: toAddress,
    },
    pubkey: publicKey.value,
  };
  const res = await fetch(requestURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });
  const responseData = await res.json();

  return responseData;
};
