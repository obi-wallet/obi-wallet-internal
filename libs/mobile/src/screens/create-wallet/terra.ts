import {
  Draft,
  MultisigKey,
  RequestObiTerraSignAndBroadcastMsg,
  terra,
  TerraChain,
  WalletsStore,
} from "@obi-wallet/common";
import { Alert } from "react-native";

export async function handleTerra({
  draft,
  demoMode,
  walletsStore,
  chainId,
}: {
  draft: Draft<MultisigKey>;
  demoMode: boolean;
  walletsStore: WalletsStore;
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

  const response = await RequestObiTerraSignAndBroadcastMsg.send({
    multisigKey: multisigKey.serialize(),
    messages: [message.toAmino()],
    demoMode,
    cancelable: false,
    isOnboarding: true,
  });

  try {
    const serializedData = {
      chain: chainId,
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
