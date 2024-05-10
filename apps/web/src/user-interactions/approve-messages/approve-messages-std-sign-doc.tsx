import { TargetChain } from "@/target-chain";
import { isCosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { AminoSignResponse, StdSignDoc } from "@cosmjs/amino";
import { observer } from "mobx-react-lite";

import { ApproveMessages } from "./approve-messages";

export interface ApproveMessagesStdSignDocProps {
  walletMeta: {
    userEntryAddress: string;
  };
  signerAddress: string;
  signDoc: StdSignDoc;
  onReject(): void;
  onApprove(signResponse: AminoSignResponse): Promise<void>;
}

export const ApproveMessagesStdSignDoc =
  observer<ApproveMessagesStdSignDocProps>(function ApproveMessagesStdSignDoc({
    signerAddress,
    signDoc,
    onApprove,
    ...rest
  }) {
    const chainId = signDoc.chain_id;

    if (!isCosmosSdkChainId(chainId)) {
      console.error("Unsupported chainId: ", chainId);
      return null;
    }

    const targetChain = TargetChain.chainId(chainId);
    const messages = signDoc.msgs.map((msg) => {
      return targetChain.aminoTypes.fromAmino(msg);
    });

    return (
      <ApproveMessages
        targetChainId={chainId}
        messages={messages}
        memo={signDoc.memo}
        rawData={signDoc.msgs}
        onApprove={async ({
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
          const signResponse = await signer.signAmino(signerAddress, {
            ...signDoc,
            fee,
          });
          await onApprove(signResponse);
        }}
        {...rest}
      />
    );
  });
