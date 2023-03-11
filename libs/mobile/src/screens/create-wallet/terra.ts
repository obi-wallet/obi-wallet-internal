import {
  Draft,
  MultisigKey,
  RequestObiSignAndBroadcastTerraTransactionMsg,
  terra,
} from "@obi-wallet/common";
import { TerraChain } from "@obi-wallet/sdk";

export async function handleTerra({
  draft,
  demoMode,
  chainId,
}: {
  draft: Draft<MultisigKey>;
  demoMode: boolean;
  chainId: TerraChain;
}) {
  const multisigKey = draft.value;
  // TODO: shuffle?

  const signers = terra.getSigners({ multisigKey });
  const message = terra.getNewAccountMessage({
    address: multisigKey.address,
    signers,
    chainId,
  });

  const response = await RequestObiSignAndBroadcastTerraTransactionMsg.send({
    chain: draft.value.chain as TerraChain,
    messages: [message.toAmino()],
    demoMode,
    cancelable: true,
    multisigKey: multisigKey.serialize(),
  });

  try {
    return {
      chain: chainId,
      owner: multisigKey.serialize(),
      proxyAddress: terra.parseNewAccountResponse(response),
      gatekeeperConfig: {
        beneficiaries: [],
        flexAccounts: [],
      },
      singlesigWallets: [],
      currentAccount: null,
    };
  } catch (e) {
    throw new Error(response.raw_log);
  }
}
