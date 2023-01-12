import {
  isAnyCosmosMultisigWallet,
  isAnyTerraMultisigWallet,
  RequestObiSignAndBroadcastMsg,
  RequestObiTerraSignAndBroadcastMsg,
  WalletType,
} from "@obi-wallet/common";
import { Modals, useStore } from "@obi-wallet/mobile";
import { Button, View } from "react-native";

// eslint-disable-next-line import/no-default-export
export default () => {
  const { configStore, walletsStore } = useStore();

  return (
    <>
      <View style={{ paddingTop: 50 }}>
        <Button
          title="Request sign"
          onPress={async () => {
            if (!walletsStore.currentWalletId) return;
            switch (configStore.getDefaultMultisigWalletType()) {
              case WalletType.Multisig:
                await RequestObiSignAndBroadcastMsg.send({
                  id: walletsStore.currentWalletId,
                  multisig: isAnyCosmosMultisigWallet(
                    walletsStore.currentWallet
                  )
                    ? walletsStore.currentWallet.nextAdmin
                    : null,
                  encodeObjects: [],
                });
                break;
              case WalletType.TerraMultisig:
                if (!isAnyTerraMultisigWallet(walletsStore.currentWallet)) {
                  return;
                }
                await RequestObiTerraSignAndBroadcastMsg.send({
                  id: walletsStore.currentWalletId,
                  multisig: walletsStore.currentWallet.nextAdmin,
                  messages: [],
                });
            }
          }}
          color="#ffffff"
        />
      </View>
      <Modals />
    </>
  );
};
