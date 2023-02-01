import {
  ChainStore,
  Draft,
  MultisigKey,
  RequestObiTerraSignAndBroadcastMsg,
  terra,
  WalletsStore,
} from "@obi-wallet/common";
import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/terra.js";
import { Alert } from "react-native";

export async function handleTerra({
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

  console.log(multisigKey.signerTypes);

  const publicKeys = [];
  for (const key of multisigKey.keys) {
    publicKeys.push(SimplePublicKey.fromAmino(key.payload.publicKey));
  }
  const multisigPublicKey = new LegacyAminoMultisigPublicKey(
    multisigKey.threshold,
    publicKeys
  );

  const { currentTerraChainInformation } = chainStore;
  const signers = multisigPublicKey.pubkeys.map((publicKey, i) => {
    return {
      address: publicKey.address(),
      ty: multisigKey.signerTypes[i],
    };
  });

  const message = terra.getNewAccountMessage({
    address: multisigPublicKey.address(),
    signers,
    chainId: currentTerraChainInformation.chainId,
  });

  console.log(message);

  const response = await RequestObiTerraSignAndBroadcastMsg.send({
    multisigKey: multisigKey.serialize(),
    messages: [message.toAmino()],
    demoMode,
    cancelable: false,
    isOnboarding: true,
  });

  try {
    const serializedData = {
      chain: chainStore.currentChain,
      owner: multisigKey.serialize(),
      proxyAddress: terra.parseNewAccountResponse(response),
    };
    if (demoMode) {
      await walletsStore.addMultisigDemoWallet(serializedData);
    } else {
      await walletsStore.addMultisigWallet(serializedData);
    }
  } catch (e) {
    Alert.alert("Something went wrong");
  }
}
