import { Draft, terra } from "@obi-wallet/common";
import {
  MultisigKey,
  SignAndBroadcastTransactionUserInteraction,
  TerraChain,
} from "@obi-wallet/sdk";
import { BlockTxBroadcastResult } from "@terra-money/feather.js";

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

  const response = await SignAndBroadcastTransactionUserInteraction.start({
    messages: [message],
    demoMode,
    cancelable: true,
    multisigKey: multisigKey,
  });

  if (response.approved) {
    if (response.payload.success) {
      return {
        chain: chainId,
        owner: multisigKey.toJSON(),
        proxyAddress: terra.parseNewAccountResponse(
          response.payload.rawResult as BlockTxBroadcastResult
        ),
        gatekeeperConfig: {
          beneficiaries: [],
          flexAccounts: [],
        },
        singlesigWallets: [],
        currentAccount: null,
      };
    } else {
      throw new Error(response.payload.rawLog);
    }
  } else {
    // TODO: handle more gracefully
    throw new Error("User denied");
  }
}
