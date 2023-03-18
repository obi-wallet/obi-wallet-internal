import {
  cosmos,
  Draft,
  RequestObiCosmosSignAndBroadcastMsg,
} from "@obi-wallet/common";
import { CosmosChain, ObservableMultisigKey, Sdk } from "@obi-wallet/sdk";

export async function handleCosmos({
  draft,
  demoMode,
  chainId,
}: {
  draft: Draft<ObservableMultisigKey>;
  demoMode: boolean;
  chainId: CosmosChain;
}) {
  const multisigKey = draft.value;
  // TODO: shuffle?

  const signers = multisigKey.keys.map((key, i) => {
    return {
      address: Sdk.chainId(chainId).getAddressOfPublicKey({
        publicKey: key.publicKey,
      }),
      ty: multisigKey.signerTypes[i],
    };
  });
  const owner = multisigKey.address;

  const message = cosmos.getNewAccountMessage({
    address: owner,
    signers,
    chainId,
  });

  const response = await RequestObiCosmosSignAndBroadcastMsg.send({
    multisigKey: multisigKey.toJSON(),
    encodeObjects: [message],
    demoMode,
    isOnboarding: true,
  });

  try {
    return {
      chain: chainId,
      owner: multisigKey.toJSON(),
      proxyAddress: {
        v: 1 as const,
        ...cosmos.parseNewAccountResponse(response),
      },
      gatekeeperConfig: {
        beneficiaries: [],
        flexAccounts: [],
      },
      singlesigWallets: [],
      currentAccount: null,
    };
  } catch (e) {
    throw new Error(response.rawLog);
  }
}
