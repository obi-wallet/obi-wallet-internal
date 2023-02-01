import {
  ChainStore,
  cosmos,
  CosmosChain,
  cosmosChains,
  Draft,
  isCosmosChain,
  MultisigKey,
  RequestObiCosmosSignAndBroadcastMsg,
  WalletsStore,
} from "@obi-wallet/common";
import invariant from "tiny-invariant";

export async function handleCosmos({
  draft,
  demoMode,
  walletsStore,
  chainId,
}: {
  draft: Draft<MultisigKey>;
  demoMode: boolean;
  walletsStore: WalletsStore;
  chainId: CosmosChain;
}) {
  const multisigKey = draft.value;
  // TODO: shuffle?

  const multisigPublicKey = cosmos.createMultisigPublicKey({
    multisigKey,
  });

  const signers = multisigPublicKey.value.pubkeys.map((publicKey, i) => {
    return {
      address: cosmos.getAddress({
        publicKey,
        chainId,
      }),
      ty: multisigKey.signerTypes[i],
    };
  });

  const owner = cosmos.getAddress({
    publicKey: multisigPublicKey,
    chainId,
  });

  const message = cosmos.getNewAccountMessage({
    address: owner,
    signers,
    chainId,
  });

  const response = await RequestObiCosmosSignAndBroadcastMsg.send({
    multisigKey: multisigKey.serialize(),
    encodeObjects: [message],
    demoMode,
    cancelable: false,
    isOnboarding: true,
  });

  try {
    const { currentCodeId } = cosmosChains[chainId];

    const serializedData = {
      chain: chainId,
      owner: multisigKey.serialize(),
      proxyAddress: {
        ...cosmos.parseNewAccountResponse(response),
        // TODO: get from response
        codeId: currentCodeId,
      },
    };
    if (demoMode) {
      await walletsStore.addMultisigDemoWallet(serializedData);
    } else {
      await walletsStore.addMultisigWallet(serializedData);
    }
  } catch (e) {
    console.log(response.rawLog);
  }
}
