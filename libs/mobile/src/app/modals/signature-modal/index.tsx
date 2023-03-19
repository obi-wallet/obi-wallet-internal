import {
  createObservableMultisigKey,
  Secp256k1PrivateKeySigner,
} from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import * as R from "ramda";

import { AbstractSignatureModalProps } from "./common";
import { SignatureModalFlexAccount } from "./flex-account";
import { SignatureModalMultisigKey } from "./multisig-key";
import { SignatureModalRawKey } from "./raw-key";
import { useStore } from "../../stores";

export type SignatureModalProps = AbstractSignatureModalProps;

export const SignatureModal = observer<SignatureModalProps>(
  function SignatureModal({ data, ...props }) {
    const { walletsStore } = useStore();

    if (R.has("walletMeta", data)) {
      const wallet = walletsStore.getWallet(data.walletMeta.walletId);
      const currentAccount = data.walletMeta.currentAccount
        ? wallet.getAccount(data.walletMeta.currentAccount)
        : null;

      if (!currentAccount) {
        const multisigKey = wallet.owner;
        return (
          <SignatureModalMultisigKey
            {...props}
            data={data}
            multisigKey={multisigKey}
            proxyAddress={wallet.proxyAddress}
          />
        );
      }

      if (currentAccount && currentAccount.type === "singlesig-wallet") {
        const signer = new Secp256k1PrivateKeySigner(currentAccount.privateKey);
        return <SignatureModalRawKey {...props} data={data} signer={signer} />;
      }

      if (currentAccount && currentAccount.type === "flex-account") {
        const flexAccount = new Secp256k1PrivateKeySigner(
          currentAccount.privateKey
        );
        const multisigKey = wallet.owner;
        return (
          <SignatureModalFlexAccount
            {...props}
            data={data}
            flexAccount={flexAccount}
            multisigKey={multisigKey}
            proxyAddress={wallet.proxyAddress}
          />
        );
      }
    } else if (R.has("multisigKey", data)) {
      const multisigKey = createObservableMultisigKey(
        data.chain,
        data.multisigKey
      );
      return (
        <SignatureModalMultisigKey
          {...props}
          data={data}
          multisigKey={multisigKey}
        />
      );
    }

    return null;
  }
);
