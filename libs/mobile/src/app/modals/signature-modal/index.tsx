import { Secp256k1PrivateKeySigner } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import * as R from "ramda";

import { AbstractSignatureModalProps } from "./common";
import { SignatureModalFlexAccount } from "./flex-account";
import { SignatureModalMultisigKey } from "./multisig-key";
import { SignatureModalRawKey } from "./raw-key";
import { useStore } from "../../stores";

export type SignatureModalProps = AbstractSignatureModalProps;

export const SignatureModal = observer<SignatureModalProps>(
  function SignatureModal({ interaction }) {
    const { walletsStore } = useStore();
    const { payload } = interaction;

    if (R.has("walletMeta", payload)) {
      const wallet = walletsStore.getWallet(payload.walletMeta.walletId);

      if (!wallet) return null;

      const chainId = wallet.chainId;

      const currentAccount = payload.walletMeta.currentAccount
        ? wallet.getAccount(payload.walletMeta.currentAccount)
        : null;

      if (!currentAccount) {
        const multisigKey = wallet.owner;
        return (
          <SignatureModalMultisigKey
            interaction={interaction}
            chainId={chainId}
            multisigKey={multisigKey}
            proxyAddress={wallet.proxyAddress}
          />
        );
      }

      if (currentAccount && currentAccount.type === "singlesig-wallet") {
        const signer = new Secp256k1PrivateKeySigner(currentAccount.privateKey);
        return (
          <SignatureModalRawKey
            interaction={interaction}
            chainId={chainId}
            signer={signer}
          />
        );
      }
      //
      if (currentAccount && currentAccount.type === "flex-account") {
        const flexAccount = new Secp256k1PrivateKeySigner(
          currentAccount.privateKey
        );
        const multisigKey = wallet.owner;
        return (
          <SignatureModalFlexAccount
            interaction={interaction}
            chainId={chainId}
            flexAccount={flexAccount}
            multisigKey={multisigKey}
            proxyAddress={wallet.proxyAddress}
          />
        );
      }
    } else if (R.has("multisigKey", payload)) {
      return (
        <SignatureModalMultisigKey
          chainId={payload.multisigKey.chain}
          interaction={interaction}
          multisigKey={payload.multisigKey}
        />
      );
    }

    return null;
  }
);
