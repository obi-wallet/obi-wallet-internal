import {
  isAnyCosmosMultisigWallet,
  RequestObiSignAndBroadcastMsg,
} from "@obi-wallet/common";
import { SignInteractionModal, useStore } from "@obi-wallet/mobile";
import { Button, View } from "react-native";

// eslint-disable-next-line import/no-default-export
export default () => {
  const { walletsStore } = useStore();

  return (
    <>
      <View style={{ paddingTop: 50 }}>
        <Button
          title="Request sign"
          onPress={async () => {
            if (!walletsStore.currentWalletId) return;
            await RequestObiSignAndBroadcastMsg.send({
              id: walletsStore.currentWalletId,
              // TODO: handle terra multisig wallet
              multisig: isAnyCosmosMultisigWallet(walletsStore.currentWallet)
                ? walletsStore.currentWallet.nextAdmin
                : null,
              encodeObjects: [],
            });
          }}
          color="#ffffff"
        />
      </View>
      <SignInteractionModal />
    </>
  );
};
