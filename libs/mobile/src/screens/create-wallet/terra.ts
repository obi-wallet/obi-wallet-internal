import {
  ChainStore,
  Draft,
  MultisigKey,
  RequestObiTerraSignAndBroadcastMsg,
  terra,
  TerraMultisigWallet,
} from "@obi-wallet/common";
import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/terra.js";
import { Alert } from "react-native";

export async function handleTerra({
  draft,
  chainStore,
  demoMode,
}: {
  draft: Draft<MultisigKey>;
  chainStore: ChainStore;
  demoMode: boolean;
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

  // const multisig = wallet.nextAdmin;
  //
  // if (!multisig.multisig?.address) return;
  //
  const { currentTerraChainInformation } = chainStore;
  //
  const signers = multisigPublicKey.pubkeys.map((publicKey, i) => {
    return {
      address: publicKey.address(),
      ty: multisigKey.signerTypes[i],
    };
  });
  //
  const message = terra.getNewAccountMessage({
    address: multisigPublicKey.address(),
    signers,
    chainId: currentTerraChainInformation.chainId,
  });

  console.log(message);

  // const response = await RequestObiTerraSignAndBroadcastMsg.send({
  //   id: wallet.id,
  //   messages: [message.toAmino()],
  //   multisig,
  //   cancelable: false,
  //   isOnboarding: true,
  // });
  //
  // try {
  //   await wallet.finishProxySetup(terra.parseNewAccountResponse(response));
  // } catch (e) {
  //   Alert.alert("Something went wrong");
  // }
}
