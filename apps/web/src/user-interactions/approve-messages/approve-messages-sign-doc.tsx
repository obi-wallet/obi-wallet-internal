import { TargetChain } from "@/target-chain";
import { isCosmosChainId } from "@/target-chain/cosmos/chains";
import { CosmosMpcSigner } from "@/target-chain/cosmos/mpc-signer";
import { CosmosSignDirectUserInteraction } from "@/user-interactions/sign-and-broadcast/evm/cosmos-sign-direct";
import { DecodeObject } from "@cosmjs/proto-signing";
import { StdFee } from "@cosmjs/stargate";
import { AuthInfo, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { observer } from "mobx-react-lite";
import invariant from "tiny-invariant";

import { ApproveMessages, ApproveMessagesProps } from "./approve-messages";

export interface ApproveMessagesSignDocProps {
  interaction: CosmosSignDirectUserInteraction;
}

export const ApproveMessagesSignDoc = observer<ApproveMessagesSignDocProps>(
  function ApproveMessagesSignDoc({ interaction }) {
    const props =
      cosmosSignDirectUserInteractionToApproveMessagesProps(interaction);

    return <ApproveMessages {...props} />;
  },
);

export function cosmosSignDirectUserInteractionToApproveMessagesProps(
  interaction: CosmosSignDirectUserInteraction,
): ApproveMessagesProps {
  const { signDoc, signerAddress } = interaction.payload;

  const chainId = `cosmos:${signDoc.chainId}`;
  invariant(isCosmosChainId(chainId), "Invalid chainId");

  const targetChain = TargetChain.chainId(chainId);

  // decodeTxBody gives only the decoded values of the messages without their typeUrl
  const decodedBodyWithDecodedMessageValues = targetChain.registry.decodeTxBody(
    signDoc.bodyBytes,
  );
  // TxBody.decode reports the typeUrl of the messages but doesn't decode the values
  const decodedBodyWithMessageTypeUrls = TxBody.decode(signDoc.bodyBytes);
  // Combining those two gives us what we actually want
  const encodeObjects = decodedBodyWithDecodedMessageValues.messages.map(
    (value, index) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const { typeUrl } = decodedBodyWithMessageTypeUrls.messages[
        index
      ] as DecodeObject;
      return { typeUrl, value };
    },
  );

  const sign = async ({
    fee,
    signer,
  }: {
    fee: StdFee;
    signer: CosmosMpcSigner;
  }) => {
    const previousAuthInfo = AuthInfo.decode(signDoc.authInfoBytes);
    const newAuthInfo = AuthInfo.fromPartial({
      ...previousAuthInfo,
      fee: {
        amount: [...fee.amount],
        gasLimit: BigInt(fee.gas),
        granter: fee.granter,
        payer: fee.payer,
      },
    });
    const authInfoBytes = AuthInfo.encode(newAuthInfo).finish();

    return await signer.signDirect(signerAddress, {
      ...signDoc,
      authInfoBytes,
    });
  };

  return {
    walletMeta: interaction.payload.walletMeta,
    targetChainId: chainId,
    messages: encodeObjects,
    memo: decodedBodyWithDecodedMessageValues.memo,
    rawData: encodeObjects,
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
