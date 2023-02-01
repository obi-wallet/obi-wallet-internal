import {
  ChainStore,
  cosmos,
  Draft,
  MultisigKey,
  RequestObiCosmosSignAndBroadcastMsg,
  WalletsStore,
} from "@obi-wallet/common";

export async function handleCosmos({
  draft,
  demoMode,
  chainStore,
  walletsStore,
}: {
  draft: Draft<MultisigKey>;
  demoMode: boolean;
  chainStore: ChainStore;
  walletsStore: WalletsStore;
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
        chainId: chainStore.currentCosmosChain,
      }),
      ty: multisigKey.signerTypes[i],
    };
  });

  const owner = cosmos.getAddress({
    publicKey: multisigPublicKey,
    chainId: chainStore.currentCosmosChain,
  });

  const message = cosmos.getNewAccountMessage({
    address: owner,
    signers,
    chainId: chainStore.currentCosmosChain,
  });

  const response = await RequestObiCosmosSignAndBroadcastMsg.send({
    multisigKey: multisigKey.serialize(),
    encodeObjects: [message],
    demoMode,
    cancelable: false,
    isOnboarding: true,
  });

  try {
    const serializedData = {
      chain: chainStore.currentChain,
      owner: multisigKey.serialize(),
      proxyAddress: {
        ...cosmos.parseNewAccountResponse(response),
        codeId: chainStore.currentCosmosChainInformation.currentCodeId,
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
