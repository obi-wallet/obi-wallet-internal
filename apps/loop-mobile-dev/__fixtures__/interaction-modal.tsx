import {
  isAnyMultisigWallet,
  RequestObiSignAndBroadcastMsg,
} from "@obi-wallet/common";
import { InteractionModal, useStore } from "@obi-wallet/mobile";
import { useEffect } from "react";

// eslint-disable-next-line import/no-default-export
export default () => {
  const { walletsStore } = useStore();

  useEffect(() => {
    (async () => {
      if (!walletsStore.currentWalletId) return;
      await RequestObiSignAndBroadcastMsg.send({
        id: walletsStore.currentWalletId,
        multisig: isAnyMultisigWallet(walletsStore.currentWallet)
          ? walletsStore.currentWallet.nextAdmin
          : null,
        encodeObjects: [],
      });
    })();
  }, [walletsStore]);

  return <InteractionModal />;
};
