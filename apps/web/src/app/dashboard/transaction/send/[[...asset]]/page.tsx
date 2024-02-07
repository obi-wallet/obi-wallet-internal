"use client";
import { ToAsset, toAssets } from "@/app/dashboard/fast-travel/assets";
import { BalanceInput, Button, IBalanceOption, Input } from "@/components";
import { Balance, useBalances } from "@/hooks/balances";
import { usePublicKey } from "@/hooks/use-public-key";
import { TargetChainId, TargetChains } from "@/target-chain";
import { observer } from "mobx-react-lite";

const Send = observer(function Send({
  params,
}: {
  params: { asset: string | undefined };
}) {
  const asset = params.asset?.[0]?.toLowerCase();

  const publicKey = usePublicKey();
  const balances = useBalances({ publicKey });
  const loading = balances.every((b) => b.isLoading);
  if (loading) return <div>Loading...</div>;

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
    const asset = toAssets[
      Object.keys(toAssets).find((key) => toAssets[key]?.denom === b?.denom) ??
        ""
    ] as ToAsset;
    const amount = Number(b?.amount);
    const decimals = asset?.decimals ?? 0;
    // get amount using the asset's decimals
    const decimalAmount = amount / Math.pow(10, decimals);

    return {
      image: asset?.image,
      network: TargetChains[b?.chainId as TargetChainId]?.name,
      assetUnit: asset.label,
      balance: decimalAmount,
    };
  });

  return (
    <div className="space-y-7 py-4">
      <BalanceInput
        label="Amount"
        balances={balanceOptions}
        selectedAsset={balanceOptions.find(
          (b) => b.assetUnit.toLowerCase() === asset,
        )}
      />
      <Input labelText="Recipient Address" />
      <div className="flex justify-end">
        <Button className="block w-44">Next</Button>
      </div>
    </div>
  );
});
export default Send;
