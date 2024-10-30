import { TargetChain } from "@/target-chain";
import { isCosmosChainId } from "@/target-chain/cosmos/chains";
import { CosmosMpcSigner } from "@/target-chain/cosmos/mpc-signer";
import { CosmosSignAminoUserInteraction } from "@/user-interactions/sign-and-broadcast/evm/cosmos-sign-amino";
import { StdFee } from "@cosmjs/stargate";
import { observer } from "mobx-react-lite";
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
      await signer.mpcSigner.addIntentionsResults({
        payload: intentionsPayload,
        results: intentionsResults,
      });
      const signResponse = await sign({ fee, signer });
      interaction.resolve({
        approved: true,
        payload: signResponse,
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
