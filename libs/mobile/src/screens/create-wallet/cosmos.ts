import {
  cosmos,
  Draft,
  MultisigKey,
  RequestObiCosmosSignAndBroadcastMsg,
} from "@obi-wallet/common";
import { CosmosChain, Sdk, Secp256k1PublicKey } from "@obi-wallet/sdk";

export async function handleCosmos({
  draft,
  demoMode,
  chainId,
}: {
  draft: Draft<MultisigKey>;
  demoMode: boolean;
  chainId: CosmosChain;
}) {
  const multisigKey = draft.value;
  // TODO: shuffle?

  const multisigPublicKey = cosmos.createMultisigPublicKey({
    multisigKey,
  });

  const signers = multisigPublicKey.value.pubkeys.map((publicKey, i) => {
    return {
      address: Sdk.chainId(chainId).getAddressOfPublicKey({
        publicKey: publicKey as Secp256k1PublicKey,
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
    isOnboarding: true,
  });

  try {
    return {
      chain: chainId,
      owner: multisigKey.serialize(),
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
