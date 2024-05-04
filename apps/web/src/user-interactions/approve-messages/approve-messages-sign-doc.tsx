import { TargetChain } from "@/target-chain";
import { isCosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { DecodeObject, DirectSignResponse } from "@cosmjs/proto-signing";
import { AuthInfo, SignDoc, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { observer } from "mobx-react-lite";

import { ApproveMessages } from "./approve-messages";

export interface ApproveMessagesSignDocProps {
  walletMeta: {
    userEntryAddress: string;
  };
  signerAddress: string;
  signDoc: SignDoc;
  onReject(): void;
  onApprove(signResponse: DirectSignResponse): Promise<void>;
}

export const ApproveMessagesSignDoc = observer<ApproveMessagesSignDocProps>(
  function ApproveMessagesSignDoc({
    signerAddress,
    signDoc,
    onApprove,
    ...rest
  }) {
    const chainId = signDoc.chainId;

    if (!isCosmosSdkChainId(chainId)) {
      console.error("Unsupported chainId: ", chainId);
      return null;
    }

    const targetChain = TargetChain.chainId(chainId);

    // decodeTxBody gives only the decoded values of the messages without their typeUrl
    const decodedBodyWithDecodedMessageValues =
      targetChain.registry.decodeTxBody(signDoc.bodyBytes);
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

    return (
      <ApproveMessages
        targetChainId={chainId}
        messages={encodeObjects}
        memo={decodedBodyWithDecodedMessageValues.memo}
        rawData={encodeObjects}
        onApprove={async ({
          wallet,
          fee,
          intentionsPayload,
          intentionsResults,
        }) => {
          const signer = await targetChain.getSigner(wallet);
          signer.addIntentionsResults({
            payload: intentionsPayload,
            results: intentionsResults,
          });
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
          const signResponse = await signer.signDirect(signerAddress, {
            ...signDoc,
            authInfoBytes,
          });

          await onApprove(signResponse);
        }}
        {...rest}
      />
    );
  },
);
