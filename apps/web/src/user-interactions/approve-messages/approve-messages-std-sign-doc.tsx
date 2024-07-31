import { TargetChain } from "@/target-chain";
import { isCosmosChainId } from "@/target-chain/cosmos/chains";
import { CosmosMpcSigner } from "@/target-chain/cosmos/mpc-signer";
import { CosmosSignAminoUserInteraction } from "@/user-interactions/sign-and-broadcast/evm/cosmos-sign-amino";
import { makeSignDoc, serializeSignDoc, StdSignDoc } from "@cosmjs/amino";
import { Sha256 } from "@cosmjs/crypto";
import { StdFee } from "@cosmjs/stargate";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { observer } from "mobx-react-lite";
import { fromBase64 } from "secretjs";
import { AminoSignResponse } from "secretjs/dist/wallet_amino";
import invariant from "tiny-invariant";

import { ApproveMessages, ApproveMessagesProps } from "./approve-messages";

export interface ApproveMessagesStdSignDocProps {
  interaction: CosmosSignAminoUserInteraction;
}

export const ApproveMessagesStdSignDoc =
  observer<ApproveMessagesStdSignDocProps>(function ApproveMessagesStdSignDoc({
    interaction,
  }) {
    const props = cosmosSignAminoToApproveMessagesProps(interaction);

    return <ApproveMessages {...props} />;
  });

export function cosmosSignAminoToApproveMessagesProps(
  interaction: CosmosSignAminoUserInteraction,
): ApproveMessagesProps {
  const { signDoc, signerAddress } = interaction.payload;

  const chainId = `cosmos:${signDoc.chain_id}`;
  invariant(isCosmosChainId(chainId), "Invalid chainId");

  const targetChain = TargetChain.chainId(chainId);
  const messages = signDoc.msgs.map((msg) => {
    return targetChain.aminoTypes.fromAmino(msg);
  });

  const sign = async ({
    fee,
    signer,
  }: {
    fee: StdFee;
    signer: CosmosMpcSigner;
  }) => {
    return await signer.signAmino(signerAddress, {
      ...signDoc,
      fee,
    });
  };

  const getTxHashFromSignDoc = (
    signDoc: StdSignDoc,
    { signature }: AminoSignResponse,
  ) => {
    // get bodyBytes and authInfoBytes
    const fee: StdFee = {
      amount: signDoc.fee.amount,
      gas: signDoc.fee.gas,
    };

    const aminoMsgs = signDoc.msgs.map((msg) => {
      return {
        type: msg.type,
        value: msg.value,
      };
    });

    const aminoSignDoc = makeSignDoc(
      aminoMsgs,
      fee,
      signDoc.chain_id,
      signDoc.memo,
      signDoc.account_number,
      signDoc.sequence,
    );

    const bodyBytes = serializeSignDoc(aminoSignDoc);
    const authInfoBytes = new Uint8Array();

    // get txHash
    const txRaw = TxRaw.fromPartial({
      bodyBytes,
      authInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });

    const txRawBytes = Uint8Array.from(TxRaw.encode(txRaw).finish());

    const hash = new Sha256();
    hash.update(txRawBytes);
    const txHash = Buffer.from(hash.digest()).toString("hex");
    return txHash;
  };

  return {
    walletMeta: interaction.payload.walletMeta,
    targetChainId: chainId,
    messages: messages,
    memo: signDoc.memo,
    rawData: signDoc.msgs,
    onApprove: async ({
      wallet,
      fee,
      intentionsPayload,
      intentionsResults,
    }) => {
      const signer = await targetChain.getSigner(wallet);
      signer.mpcSigner.addIntentionsResults({
        payload: intentionsPayload,
        results: intentionsResults,
      });
      const signResponse = await sign({ fee, signer });
      const txHash = getTxHashFromSignDoc(signDoc, signResponse);

      // TODO: we are now gettign wrong hash from this code
      interaction.resolve({
        approved: true,
        payload: {
          ...signResponse,
          txHash,
        },
      });
    },
    onReject: () => {
      interaction.resolve({
        approved: false,
      });
    },
    calculateHashToSign: async ({ wallet, fee }) => {
      const signer = await targetChain.getSigner(wallet);
      return await signer.mpcSigner.calculateHashToSign(async () => {
        await sign({ fee, signer });
      });
    },
  };
}
