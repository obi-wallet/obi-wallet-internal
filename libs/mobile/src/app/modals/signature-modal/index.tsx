import { MultisigKey } from "@obi-wallet/common";
import { Secp256k1PrivateKeySigner } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import * as R from "ramda";

import { AbstractSignatureModalProps } from "./common";
import { SignatureModalFlexAccount } from "./flex-account";
import { SignatureModalMultisigKey } from "./multisig-key";
import { SignatureModalRawKey } from "./raw-key";
import { useStore } from "../../stores";

export * from "./cosmos";

export type SignatureModalProps = AbstractSignatureModalProps;

export const SignatureModal = observer<SignatureModalProps>(
  function SignatureModal({ data, ...props }) {
    const { walletsStore } = useStore();

    if (R.has("walletMeta", data)) {
      const wallet = walletsStore.getWallet(data.walletMeta.walletId);
      const currentAccount = data.walletMeta.currentAccount
        ? wallet.getAccounts().get({ id: data.walletMeta.currentAccount.id })
        : null;

      if (!currentAccount) {
        const multisigKey = wallet.owner;
        return (
          <SignatureModalMultisigKey
            {...props}
            data={data}
            multisigKey={multisigKey}
            proxyAddress={wallet.proxyAddress.address}
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
            proxyAddress={wallet.proxyAddress.address}
          />
        );
      }
    } else if (R.has("multisigKey", data)) {
      const multisigKey = MultisigKey.deserialize({
        serialized: data.multisigKey,
        chain: data.chain,
      });
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
