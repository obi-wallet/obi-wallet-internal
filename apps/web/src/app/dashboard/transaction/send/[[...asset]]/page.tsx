"use client";

import { ToAsset, toAssets } from "@/app/dashboard/fast-travel/assets";
import { BalanceInput, Button, IBalanceOption, Input } from "@/components";
import { Balance, useBalances } from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { TargetChain } from "@/target-chain";
import {
  CosmosSdkChainId,
  CosmosSdkChains,
} from "@/target-chain/cosmos-sdk/chains";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { calculateFee, SigningStargateClient } from "@cosmjs/stargate";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";

const Send = observer(function Send({
  params,
}: {
  params: { asset: string | undefined };
}) {
  const wallet = useCurrentWallet({});
  const asset = params.asset?.[0]?.toLowerCase();

  const publicKey = usePublicKey();
  const balances = useBalances({ publicKey });
  const loading = balances.every((b) => b.isLoading);

  const send = useMutation({
    mutationFn: async () => {
      if (!wallet) return;
      const chainId = CosmosSdkChainId.Sei;
      const rpc = CosmosSdkChains[chainId].rpc;
      const signer = await CosmosSdkMpcSigner.fromWallet(wallet, chainId);
      // const signingClient = await getSigningClient(rpc, signer);

      const client = await SigningStargateClient.connectWithSigner(rpc, signer);
      const accounts = await signer.getAccounts();

      const firstAccount = accounts[0];
      if (!firstAccount) return;

      const fee = calculateFee(100000, "0.1usei");
      const result = await client.sendTokens(
        firstAccount.address,
        "sei1299v8cn9udgt7k05jmf25lzf3sy953qehz0eyh",
        [
          {
            amount: "1",
            denom: "usei",
          },
        ],
        fee,
      );
      console.log(result);
    },
  });

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
      network: TargetChain.chainId(b.chainId).label,
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
        onChange={(value) => {
          console.log("statte", value, asset);
        }}
      />
      <Input labelText="Recipient Address" />
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
