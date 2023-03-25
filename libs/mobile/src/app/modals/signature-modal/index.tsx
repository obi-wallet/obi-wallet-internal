import { observer } from "mobx-react-lite";
import * as R from "ramda";

import { AbstractSignatureModalProps } from "./common";
import { SignatureModalFlexAccount } from "./flex-account";
import { SignatureModalMultisigKey } from "./multisig-key";
import { SignatureModalSinglesigWallet } from "./singlesig-wallet";
import { useStore } from "../../stores";

export type SignatureModalProps = AbstractSignatureModalProps;

export const SignatureModal = observer<SignatureModalProps>(
  function SignatureModal({ interaction }) {
    const { walletsStore } = useStore();
    const { payload } = interaction;

    if (R.has("walletMeta", payload)) {
      const wallet = walletsStore.getWallet(payload.walletMeta.walletId);

      if (!wallet) return null;

      const currentAccount = payload.walletMeta.currentAccount
        ? wallet.getAccount(payload.walletMeta.currentAccount)
        : null;

      if (!currentAccount) {
        return (
          <SignatureModalMultisigKey
            interaction={interaction}
            multisigKey={wallet.owner}
            proxyAddress={wallet.proxyAddress}
          />
        );
      }

      if (currentAccount && currentAccount.type === "singlesig-wallet") {
        return (
          <SignatureModalSinglesigWallet
            interaction={interaction}
            wallet={wallet}
            singlesigWallet={currentAccount}
          />
        );
      }

      if (currentAccount && currentAccount.type === "flex-account") {
        return (
          <SignatureModalFlexAccount
            interaction={interaction}
            wallet={wallet}
            flexAccount={currentAccount}
          />
        );
      }
    } else if (R.has("multisigKey", payload)) {
      return (
        <SignatureModalMultisigKey
          interaction={interaction}
          multisigKey={payload.multisigKey}
        />
      );
    }

    return null;
  }
);
