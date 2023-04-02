import {
  Sdk,
  SignAndBroadcastTransactionUserInteraction,
} from "@obi-wallet/sdk";
import { MsgSend } from "@terra-money/feather.js";
import invariant from "tiny-invariant";

import { SignatureModal } from "../../src/app/modals/signature-modal";
import { useMultisigWallet } from "../../src/app/stores";
import { mockAction } from "../../src/fixture-helpers";

function SendMultisigTxFixture() {
  const wallet = useMultisigWallet();

  const interaction: SignAndBroadcastTransactionUserInteraction = {
    payload: {
      messages: [new MsgSend(wallet.address, wallet.address, { uluna: 1 })],
      walletMeta: {
        walletId: wallet.id,
        currentAccount: null,
      },
      demoMode: true,
      cancelable: true,
    },
    resolve() {
      mockAction("resolve")();
    },
    reject() {
      mockAction("reject")();
    },
  };

  return <SignatureModal interaction={interaction} />;
}

function SendFlexAccountTxFixture() {
  const wallet = useMultisigWallet();
  const flexAccount = wallet.gatekeeperConfig.flexAccounts[0];

  // TODO: add fallback
  invariant(flexAccount, "No flex account wallet");

  const interaction: SignAndBroadcastTransactionUserInteraction = {
    payload: {
      messages: [new MsgSend(wallet.address, wallet.address, { uluna: 1 })],
      walletMeta: {
        walletId: wallet.id,
        currentAccount: {
          type: "flex-account",
          id: flexAccount.address,
        },
      },
      demoMode: true,
      cancelable: true,
    },
    resolve() {
      mockAction("resolve")();
    },
    reject() {
      mockAction("reject")();
    },
  };

  return <SignatureModal interaction={interaction} />;
}

function SendSinglesigWalletTxFixture() {
  const wallet = useMultisigWallet();
  const singlesigWallet = wallet.singlesigWallets[0];

  // TODO: add fallback
  invariant(singlesigWallet, "No singlesig wallet");
  const address = Sdk.chainId("phoenix-1").getAddressOfPublicKey({
    publicKey: singlesigWallet.publicKey,
  });

  const interaction: SignAndBroadcastTransactionUserInteraction = {
    payload: {
      messages: [new MsgSend(address, address, { uluna: 1 })],
      walletMeta: {
        walletId: wallet.id,
        currentAccount: {
          type: "singlesig-wallet",
          id: singlesigWallet.publicKey.value,
        },
      },
      demoMode: true,
      cancelable: true,
    },
    resolve() {
      mockAction("resolve")();
    },
    reject() {
      mockAction("reject")();
    },
  };

  return <SignatureModal interaction={interaction} />;
}

function SendMultisigKeyTxFixture() {
  const wallet = useMultisigWallet();

  const interaction: SignAndBroadcastTransactionUserInteraction = {
    payload: {
      messages: [
        Sdk.chainId(wallet.chainId).getCreateWalletMessage(wallet.owner),
      ],
      multisigKey: wallet.owner,
      demoMode: true,
      cancelable: true,
    },
    resolve() {
      mockAction("resolve")();
    },
    reject() {
      mockAction("reject")();
    },
  };

  return <SignatureModal interaction={interaction} />;
}

export default {
  "multisig-wallet": SendMultisigTxFixture,
  "flex-account": SendFlexAccountTxFixture,
  "singlesig-wallet": SendSinglesigWalletTxFixture,
  "multisig-key": SendMultisigKeyTxFixture,
};
