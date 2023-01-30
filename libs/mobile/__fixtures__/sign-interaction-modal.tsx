import {
  isAnyCosmosMultisigWallet,
  isAnyTerraMultisigWallet,
  RequestObiCosmosSignAndBroadcastMsg,
  RequestObiTerraSignAndBroadcastMsg,
  WalletType,
} from "@obi-wallet/common";
import { Button, View } from "react-native";

import { Modals, useStore } from "../src";

export default function SignInteractionModal() {
  const { configStore, walletsStore } = useStore();

  return (
    <>
      <View style={{ paddingTop: 50 }}>
        <Button
          title="Request sign"
          onPress={async () => {
            if (!walletsStore.currentWalletId) return;
            switch (configStore.getDefaultMultisigWalletType()) {
              case WalletType.CosmosMultisig:
                await RequestObiCosmosSignAndBroadcastMsg.send({
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
}
