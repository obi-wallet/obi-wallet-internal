"use client";
import {
  FromAsset,
  fromAssets,
  ToAsset,
  toAssets,
} from "@/app/dashboard/fast-travel/assets";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { cn } from "@/lib/utils";
import { TargetChain } from "@/target-chain";
import { CosmosSdkChains } from "@/target-chain/cosmos-sdk/chains";
import { zodResolver } from "@hookform/resolvers/zod";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import copy from "copy-to-clipboard";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import * as R from "ramda";
import { useEffect, useRef, useState } from "react";
import { Controller, ControllerFieldState, useForm } from "react-hook-form";
import { FaCheck, FaExclamation, FaSpinner } from "react-icons/fa6";
import invariant from "tiny-invariant";
import { z } from "zod";

import { AssetInput, Box, Button, Text } from "..";
import { nonEmptyString } from "../../../lib/form/validation-helpers";
import { Divider } from "../divider";
import { IAssetOption } from "../dropdown";

export type PriceData = {
  mainVsPrice: number;
  mainUsd: number;
  vsUsd: number;
};
export type AssetAmmount = {
  amount: number | undefined;
  asset: string | undefined;
};
interface IToleranceProps {
  field: {
    onChange: (value: number | undefined) => void;
    value: number | undefined;
    onBlur: () => void;
  };
  fieldState: ControllerFieldState;
  errorMessage?: string;
}
interface ITravelModalProps {
  targetAsset: string;
  onDismiss?: () => void;
  modal?: boolean;
  cancelLabel?: string;
}
interface FormData {
  fromAsset: {
    amount: number | undefined;
    asset: string | undefined;
  };
  toAsset: {
    amount: number | undefined;
    asset: string | undefined;
  };
  slippage: number;
}
export const TravelModal = observer<ITravelModalProps>(function TravelModal({
  targetAsset,
  onDismiss,
  modal = true,
  cancelLabel = "Accept",
}) {
  const [focused, setFocused] = useState<boolean>(false);
  const [direction, setDirection] = useState<"from" | "to">();
  const publicKey = usePublicKey();
  const currentWallet = useCurrentWallet({ redirectIfFound: false });

  const schema = z.object({
    fromAsset: z.object({
      // amount should be undefined or number
      amount: z.number().min(0, "Amount must be greater than 0"),
      asset: z.string().refine(nonEmptyString, "Asset is required"),
    }),
    toAsset: z.object({
      amount: z.number().min(1, "Amount must be greater than 0"),
      asset: z.string().refine(nonEmptyString, "Asset is required"),
    }),
    slippage: z
      .number()
      .min(1, "Slippage must be greater than 1")
      .max(100, "Slippage must be less than 100"),
  });

  const {
    control,

    formState,
    watch,
    getValues,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      fromAsset: {
        amount: undefined,
        asset: undefined,
      },
      toAsset: {
        amount: undefined,
        asset: targetAsset,
      },
      slippage: 1,
    },
    mode: "onTouched",
    resolver: zodResolver(schema),
  });
  const fromAssetValue = watch("fromAsset");
  const toAssetValue = watch("toAsset");
  const slippageValue = watch("slippage");

  const [loading, setLoading] = useState<boolean>(false);
  // const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const router = useRouter();

  const [depositAddress, setDepositAddress] = useState<string | undefined>(
    undefined,
  );
  const [addressCopied, setAddressCopied] = useState<boolean>(false);

  const executeTx = async () => {
    if (!isDataValid()) return;
    // get the deposit data
    const from = fromAssets[fromAssetValue?.asset ?? ""];
    setLoading(true);
    const ethereum = window.ethereum;
    if (!ethereum) {
      console.error("Ethereum provider not found");
      return;
    }
    await ethereum.request({ method: "eth_requestAccounts" });
    const walletChainId = await ethereum.request({ method: "eth_chainId" });
    const chainId = from?.chainId;

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

    try {
      if (fromAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        //transfer the asset to the deposit address using native transfer
        const tx = {
          to: depositAddress,
          value: amount.toString(),
        };

        const transaction = await signer.sendTransaction(tx);
        console.log("Transaction hash:", transaction.hash);
        // setTxHash(transaction.hash);
        alert("Transaction sent!");
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
        alert("Transaction sent!");
        router.push("/dashboard");
      }
    } catch (e) {
      setLoading(false);
      alert((e as { message: string }).message);
      console.error(e);
    }
  };

  const getAssetOptions = (assets: {
    [key: string]: FromAsset | ToAsset;
  }): IAssetOption[] => {
    return Object.entries(assets).map(([key, asset]) => ({
      label: asset.label,
      image: asset.image,
      value: key,
      disabled: asset.disabled,
    })) as IAssetOption[];
  };
  const handleFromAssetChange = async () => {
    const fromData = getValues("fromAsset");
    const toData = getValues("toAsset");

    // if non of the assets are set we don't need to do anything
    if (!fromData?.asset || !toData?.asset) return;
    // if both amounts are not set we don't need to do anything
    if (!fromData.amount && !toData.amount) return;

    if (direction === "to" && fromData.asset !== undefined) {
      handleToAssetChange();
      return;
    }

    if (!fromData) return;
    if (!fromData.asset || fromData.asset === "") return;
    if (!toData.asset) return;
    const price = (await getPrice({
      mainCoin: fromAssets[fromData.asset] as FromAsset,
      vsCoin: toAssets[toData.asset] as ToAsset,
    })) as number;

    const toAssetAmount = price * (Number(fromData?.amount) ?? 0);

    setValue("toAsset", {
      ...getValues("toAsset"),
      amount: toAssetAmount,
    });
  };

  const handleToAssetChange = async () => {
    const fromData = getValues("fromAsset");
    const toData = getValues("toAsset");
    // if non of the assets are set we don't need to do anything
    if (!fromData?.asset || !toData?.asset) return;
    // if both amounts are not set we don't need to do anything
    if (!fromData.amount && !toData.amount) return;

    if (direction === "from" && toData.asset !== undefined) {
      handleFromAssetChange();
      return;
    }
    if (!toData) return;
    if (!toData.asset || toData.asset === "") return;
    const fromAssetAsset = getValues("fromAsset").asset;
    if (!fromAssetAsset) return;
    const price = (await getPrice({
      mainCoin: toAssets[toData.asset] as ToAsset,
      vsCoin: fromAssets[fromAssetAsset] as FromAsset,
    })) as number;

    const fromAssetAmount = price * (Number(toData?.amount) ?? 0);
    setValue("fromAsset", {
      ...getValues("fromAsset"),
      amount: fromAssetAmount,
    });
  };

  const isDataValid = () => {
    return Object.keys(formState.errors).length === 0;
  };

  return (
    <div
      className={cn(
        "top-0 flex h-full w-full items-center justify-center rounded-md bg-black/30 backdrop-blur-sm",
        modal ? "absolute" : "relative",
      )}
    >
      <Box
        className={cn(
          "w-[560px] space-y-4 pt-6 sm:shadow-lg sm:shadow-neutral-600",
        )}
      >
        <Text size="xl">Obi Fast Travel</Text>
        <Text size="sm" className=" leading-5">
          Deposit assets below from an external account to receive them in your
          Obi account.
        </Text>
        <Divider />

        <Controller
          name="fromAsset"
          control={control}
          render={({ field, fieldState }) => (
            <AssetInput
              assets={getAssetOptions(fromAssets)}
              placeholder="0.1"
              labelText="Deposit"
              className="z-20"
              direction="from"
              disableTextInput={direction === "to" || !focused}
              onClick={() => {
                setDirection("from");
                setFocused(true);
              }}
              onFocus={() => {
                setDirection("from");
                setFocused(true);
              }}
              onBlur={() => setFocused(false)}
              field={{
                ...field,
                value: {
                  ...field.value,
                  amount: field.value ? Number(field.value.amount) : undefined,
                },
              }}
              fieldState={fieldState}
              onChange={handleFromAssetChange}
            />
          )}
        />
        <Controller
          name="toAsset"
          control={control}
          render={({ field, fieldState }) => (
            <AssetInput
              direction="to"
              disableTextInput={direction === "from" || !focused}
              onClick={() => {
                setDirection("to");
                setFocused(true);
              }}
              onFocus={() => {
                setDirection("to");
                setFocused(true);
              }}
              onBlur={() => setFocused(false)}
              assets={getAssetOptions(toAssets)}
              placeholder="0.1"
              labelText="Receive (estimated)"
              field={{
                ...field,
                value: {
                  ...field.value,
                  amount: field.value ? Number(field.value.amount) : undefined,
                },
              }}
              fieldState={fieldState}
              onChange={handleToAssetChange}
            />
          )}
        />
        <Controller
          name="slippage"
          control={control}
          render={({ field, fieldState }) => (
            <ToleranceSetting
              field={field}
              fieldState={fieldState}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Divider />
        {depositAddress && (
          <div
            className={cn(
              "flex-column  flex  bg-black/30 bg-opacity-10 p-5",
              addressCopied && "rounded-md  border-2 shadow-md shadow-white",
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
              Execute with Metamask or deposit to the address shown below. You
              may close this dialogue after depositing.
            </Text>
          </div>
        )}
        <GetAddressComponent
          fromAsset={fromAssetValue}
          toAsset={toAssetValue}
          slippage={slippageValue}
          addressChanged={setDepositAddress}
          slippageError={formState.errors.slippage?.message}
          publicKey={publicKey}
          onCopy={() => setAddressCopied(true)}
        />

        <div className="mt-8 flex justify-between">
          <Button className="block w-44" variant="outline" onClick={onDismiss}>
            {cancelLabel}
          </Button>

          {isDataValid() && depositAddress && window.ethereum && (
            <Button className="block w-44" onClick={executeTx}>
              Use Metamask
            </Button>
          )}
        </div>
      </Box>
      {/* add a loader spinner */}
      {loading ||
        (!currentWallet && (
          <div className="absolute top-0 z-30 flex h-full w-full flex-col items-center justify-center rounded-md bg-black/30 text-white backdrop-blur-sm">
            <FaSpinner className=" animate-spin text-2xl" />
            Loading
          </div>
        ))}
    </div>
  );
});

function ToleranceSetting({ field, fieldState }: IToleranceProps) {
  const tolerances = [1, 2];
  const [text, setText] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  // we need to trigger an onChange event from the input so we can trigger the validation
  // this is because we are using a custom input and not the one from react-hook-form
  // so we need to trigger the validation manually
  useEffect(() => {
    field.onChange(Number(text));
  }, [text]);
  useEffect(() => {
    if (field.value && !isNaN(Number(field.value))) {
      setText(field.value.toString());
    }

    field.onBlur();
  }, [field.value]);
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
        {tolerances.map((tolerance) => (
          <Box
            key={`asset-${tolerance}%`}
            className={cn(
              "w-17 flex h-9 flex-row items-center space-x-3 text-center",
              "cursor-pointer",
              field.value === tolerance
                ? "bg-background-primary"
                : "bg-gray-700",
            )}
            onClick={() => setText(tolerance.toString())}
          >
            <Text>{tolerance}%</Text>
          </Box>
        ))}
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
            onBlur={field.onBlur}
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
        {fieldState.error?.message && (
          <Text color="red" size="xs">
            {renderErrorMessage(fieldState.error.message)}
          </Text>
        )}
      </div>
    </div>
  );
}

function GetAddressComponent({
  fromAsset,
  toAsset,
  slippage,
  addressChanged,
  slippageError,
  publicKey,
  onCopy,
}: {
  publicKey?: Secp256k1PublicKey;
  fromAsset?: AssetAmmount;
  toAsset: AssetAmmount;
  slippage: number;
  slippageError?: string;
  addressChanged: (address: string | undefined) => void;
  onCopy?: () => void;
}) {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [invalid, setInvalid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (validProps()) {
      setInvalid(true);
    }

    const timer = setTimeout(() => {
      getDepositAddress();
    }, 1000); // 500ms debounce

    return () => clearTimeout(timer);
  }, [
    fromAsset?.amount,
    toAsset?.amount,
    fromAsset?.asset,
    toAsset?.asset,
    slippage,
    slippageError,
  ]);

  useEffect(() => {
    addressChanged(address);
  }, [address, addressChanged]);

  const validProps = () => {
    if (slippageError) return false;
    if (!fromAsset || !toAsset) return false;
    if (
      !fromAsset?.asset ||
      !toAsset?.asset ||
      !fromAsset?.amount ||
      !toAsset?.amount
    ) {
      return false;
    }
    if (fromAsset.amount === 0 || toAsset.amount === 0) return false;

    return true;
  };

  const getDepositAddress = async () => {
    if (!validProps()) return;
    setInvalid(false);
    setLoading(true);
    const from = fromAssets[fromAsset?.asset ?? ""];
    const to = toAssets[toAsset?.asset ?? ""];
    const slippageValue = slippage.toString();
    const chain = Object.values(CosmosSdkChains).find((chain) => {
      return chain.prefix === to?.addressPrefix;
    });
    invariant(publicKey, "Public key is required");
    invariant(chain, "Chain is required");
    const targetChain = TargetChain.chainId(chain.id);
    const toAddress = targetChain.computeAddress(publicKey);
    const fromAmount = parseUnits(
      fromAsset?.amount?.toString() ?? "0",
      from?.decimals,
    ).toString();

    const requestData = {
      slippage: slippageValue,
      from: {
        address: "0x337bd07492342e6148212b0dab1bce90e9433e7b",
        chainId: from?.chainId,
        asset: from?.address,
        amount: fromAmount,
      },
      to: {
        chainId: to?.chainId,
        asset: to?.denom,
        address: toAddress,
      },

      pubkey: publicKey?.value,
    };
    // fetch the deposit address
    const requestURL = `${process.env.NEXT_PUBLIC_FAST_TRAVEL_API_URL}/api/swap/simulate.rs`;

    // make a post request to the url
    const res = await fetch(requestURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setAddress(data.info);
    } else {
      console.error(data.error);
      alert(data.error);
    }
  };

  const renderContent = () => {
    if (slippageError) {
      return (
        <div className="flex items-center justify-center text-white">
          <FaExclamation className="text-yellow" />
          <Text className="text-yellow ml-2">Make sure slippage is valid</Text>
        </div>
      );
    }
    if (invalid) {
      return (
        <div className="flex items-center justify-center text-white">
          <FaExclamation className="text-yellow" />
          <Text className="text-yellow ml-2">Assets changed</Text>
        </div>
      );
    }
    if (loading) {
      return (
        <div className="flex items-center justify-center text-white">
          <FaSpinner className="animate-spin" />
        </div>
      );
    }
    if (address) {
      return (
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
      );
    }
    return (
      <div className="flex items-center justify-center text-white">
        <Text className="ml-2">Fill in the assets to get an address</Text>
      </div>
    );
  };

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
        {renderContent()}
      </div>
    </div>
  );
}

const fetchPrice = async (assetData: FromAsset | ToAsset | undefined) => {
  if (!assetData) return;
  // I need to know which type it is so I can use address or denom
  const isFromAsset = R.has("address", assetData);

  const requestURL = `https://api.0xsquid.com/v1/token-price?chainId=${assetData?.chainId}&tokenAddress=${
    isFromAsset
      ? (assetData as FromAsset).address
      : (assetData as ToAsset).denom
  }`;
  // make a post request to the url
  const res = await fetch(requestURL);
  const data = await res.json();

  return data.price;
};
export const getPrice = async ({
  mainCoin,
  vsCoin,
  usdPrices,
}: {
  mainCoin: FromAsset | ToAsset;
  vsCoin: FromAsset | ToAsset;
  usdPrices?: boolean;
}): Promise<number | PriceData> => {
  // get Dollar prices from squid
  const main = await fetchPrice(mainCoin);
  const vs = await fetchPrice(vsCoin);
  // we have the dollar price of both coins, now we need the price of the main coin in vs coin
  // we need to divide the main coin price by the vs coin price
  if (main && vs) {
    const mainVsPrice = Number(main) / Number(vs);
    return usdPrices
      ? {
          mainVsPrice,
          mainUsd: Number(main),
          vsUsd: Number(vs),
        }
      : mainVsPrice;
  }
  return 0;
};
