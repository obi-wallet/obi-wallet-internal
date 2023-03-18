import {
  RequestObiSignAndBroadcastTerraTransactionPayload,
  terra,
} from "@obi-wallet/common";
import { Sdk, TerraChain } from "@obi-wallet/sdk";
import { MsgSend } from "@terra-money/feather.js";
import invariant from "tiny-invariant";

import { SignatureModal } from "../../src/app/modals/signature-modal";
import { useMultisigWallet } from "../../src/app/stores";
import { mockAction } from "../../src/fixture-helpers";

function SendSinglesigWalletTxFixture() {
  const wallet = useMultisigWallet();
  const singlesigWallet = wallet.singlesigWallets[0];

  // TODO: add fallback
  invariant(singlesigWallet, "No singlesig wallet");
  const address = Sdk.chainId("phoenix-1").getAddressOfPublicKey({
    publicKey: singlesigWallet.publicKey,
  });

  const tx: RequestObiSignAndBroadcastTerraTransactionPayload = {
    chain: wallet.chain as TerraChain,
    messages: [new MsgSend(address, address, { uluna: 1 })].map((msg) =>
      msg.toAmino()
    ),
    walletMeta: {
      walletId: wallet.id,
      currentAccount: {
        type: "singlesig-wallet",
        index: 0,
      },
    },
    demoMode: true,
    cancelable: true,
  };

  return (
    <SignatureModal
      data={tx}
      onConfirm={async () => mockAction("onConfirm")()}
      onCancel={async () => mockAction("onCancel")()}
    />
  );
}

function SendMultisigTxFixture() {
  const wallet = useMultisigWallet();

  const tx: RequestObiSignAndBroadcastTerraTransactionPayload = {
    chain: wallet.chain as TerraChain,
    messages: [new MsgSend(wallet.address, wallet.address, { uluna: 1 })].map(
      (msg) => msg.toAmino()
    ),
    walletMeta: {
      walletId: wallet.id,
      currentAccount: null,
    },
    demoMode: true,
    cancelable: true,
  };

  return (
    <SignatureModal
      data={tx}
      onConfirm={async () => mockAction("onConfirm")()}
      onCancel={async () => mockAction("onCancel")()}
    />
  );
}

function SendFlexAccountTxFixture() {
  const wallet = useMultisigWallet();
  const flexAccount = wallet.gatekeeperConfig.flexAccounts[0];

  // TODO: add fallback
  invariant(flexAccount, "No flex account wallet");

  const tx: RequestObiSignAndBroadcastTerraTransactionPayload = {
    chain: wallet.chain as TerraChain,
    messages: [new MsgSend(wallet.address, wallet.address, { uluna: 1 })].map(
      (msg) => msg.toAmino()
    ),
    walletMeta: {
      walletId: wallet.id,
      currentAccount: {
        type: "flex-account",
        index: 0,
      },
    },
    demoMode: true,
    cancelable: true,
  };

  return (
    <SignatureModal
      data={tx}
      onConfirm={async () => mockAction("onConfirm")()}
      onCancel={async () => mockAction("onCancel")()}
    />
  );
}

function SendMultisigKeyTxFixture() {
  const wallet = useMultisigWallet();

  const tx: RequestObiSignAndBroadcastTerraTransactionPayload = {
    chain: wallet.chain as TerraChain,
    messages: [
      terra.getNewAccountMessage({
        address: wallet.owner.address,
        chainId: wallet.chain as TerraChain,
        signers: [],
      }),
    ].map((msg) => msg.toAmino()),
    multisigKey: wallet.owner.toJSON(),
    demoMode: true,
    cancelable: true,
  };

  return (
    <SignatureModal
      data={tx}
      onConfirm={async () => mockAction("onConfirm")()}
      onCancel={async () => mockAction("onCancel")()}
    />
  );
}

export default {
  "multisig-wallet": SendMultisigTxFixture,
  "flex-account": SendFlexAccountTxFixture,
  "singlesig-wallet": SendSinglesigWalletTxFixture,
  "multisig-key": SendMultisigKeyTxFixture,
};
