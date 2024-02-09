"use client";

import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { SignAndBroadcastTransactionUserInteractionHandler } from "@/user-interactions/sign-and-broadcast-transaction-handler";
import { MsgSendEncodeObject } from "@cosmjs/stargate";
import { NewSignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useEffectOnceWhen } from "rooks";

export default observer(function DebugPage() {
  const wallet = useCurrentWallet({});

  useEffectOnceWhen(async () => {
    if (!wallet) return;

    const signer = await CosmosSdkMpcSigner.fromWallet(
      wallet,
      CosmosSdkChainId.Sei,
    );

    const message: MsgSendEncodeObject = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: signer.address,
        toAddress: signer.address,
        amount: [
          {
            denom: "usei",
            amount: "1000000",
          },
        ],
      },
    };

    void NewSignAndBroadcastTransactionUserInteraction.start({
      messages: [message],
      cancelable: true,
      targetChainId: CosmosSdkChainId.Sei,
      walletMeta: {
        userEntryAddress: wallet.userEntryAddress,
      },
    });
  }, !!wallet);

  return (
    <SignAndBroadcastTransactionUserInteractionHandler>
      <div>Debug</div>
    </SignAndBroadcastTransactionUserInteractionHandler>
  );
});
