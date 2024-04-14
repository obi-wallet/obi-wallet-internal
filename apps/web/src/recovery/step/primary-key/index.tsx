"use client";

import { Button, ButtonLink, Modal, renderModal, Text } from "@/components";
import { useStore } from "@/contexts";
import { SecretJsHomeChain } from "@/home-chain/secret-js";
import { AddPhoneKey } from "@/keys/phone/add-phone-key";
import { AddTelegramKey } from "@/keys/phone/add-telegram-key";
import { ProxyWallet, useRecover } from "@/recovery/use-recover";
import {
  getPasskey,
  KeyMetaData,
  KeyType,
  MultisigKey,
  ObservableMultisigKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const PrimaryKeyStep = observer(function PrimaryKeyStep() {
  const { chainStore } = useStore();
  const [proxyWallets, setProxyWallets] = useState<ProxyWallet[] | null>(null);
  const recover = useRecover();
  const [modal, setModal] = useState<KeyType | null>(null);

  const recoverByPublicKey = useMutation({
    mutationFn: async ({
      publicKey,
      keyMetaData,
      modifyMultisigKey,
    }: {
      publicKey: Secp256k1PublicKey;
      keyMetaData: KeyMetaData;
      modifyMultisigKey?(multisigKey: MultisigKey): void;
    }) => {
      const chainId = chainStore.currentChain;
      const multisigKey = ObservableMultisigKey.create(chainId);
      const proxyWallets = await new SecretJsHomeChain(
        chainId,
      ).lookupWalletBackup(publicKey);

      const wallet = proxyWallets[0];

      if (wallet) {
        multisigKey.setThreshold(parseInt(wallet.owner.threshold, 10));
        wallet.owner.keys.forEach((key) => {
          switch (key.type) {
            case KeyType.Passkey:
              multisigKey.addPendingRecoveryKey({
                type: KeyType.Passkey,
                publicKey: key.publicKey,
              });
              break;
            case KeyType.Phone:
              multisigKey.addPhoneKey(key.publicKey);
              break;
            case KeyType.Telegram:
              multisigKey.addTelegramKey(key.publicKey);
              break;
          }
        });
        if (typeof modifyMultisigKey === "function") {
          modifyMultisigKey(multisigKey);
        }

        await recover({
          multisigKey,
          keyMetaData,
          account: wallet,
        });
      } else {
        setProxyWallets(proxyWallets);
      }
    },
    onError(error) {
      console.error(error);
    },
  });

  function renderKeyTypeModal() {
    if (!modal) return null;

    const onClose = () => {
      setModal(null);
    };

    if (modal === KeyType.Phone) {
      return (
        <Modal
          title="Phone Key"
          boxClassname="h-fit w-2/5 !w-[320px] !min-w-[320px] px-4 py-6 max-sm:w-full"
          onClose={onClose}
        >
          <AddPhoneKey
            onSubmit={async ({ publicKey, keyMetaData }) => {
              await recoverByPublicKey.mutateAsync({
                publicKey,
                keyMetaData: {
                  [publicKey.value]: keyMetaData,
                },
              });
            }}
            onCancel={onClose}
            askForName={false}
          />
        </Modal>
      );
    }

    if (modal === KeyType.Telegram) {
      return (
        <Modal
          title="Telegram Key"
          boxClassname="h-fit w-2/5 !w-[320px] !min-w-[320px] px-4 py-6 max-sm:w-full"
          onClose={onClose}
        >
          <AddTelegramKey
            onSubmit={async ({ publicKey, keyMetaData }) => {
              await recoverByPublicKey.mutateAsync({
                publicKey,
                keyMetaData: {
                  [publicKey.value]: keyMetaData,
                },
              });
            }}
            onCancel={onClose}
            askForName={false}
          />
        </Modal>
      );
    }
  }

  function renderProxyWalletsModal() {
    if (!proxyWallets) return null;
    if (proxyWallets.length === 0) {
      return renderModal(
        <Modal title="Existing Wallets">
          <Text color="zinc" size="xs">
            We found no wallets associated with this key. Would you like to
            create a new wallet?
          </Text>
          <Button
            onClick={() => {
              setProxyWallets(null);
            }}
            variant="primary"
            className="w-full"
          >
            Recover another wallet
          </Button>
          <ButtonLink
            href="/onboarding/internal"
            variant="outline"
            className="w-full"
          >
            Create a new wallet
          </ButtonLink>
        </Modal>,
      );
    }

    return null;
  }

  return (
    <>
      <Text fontWeight="bold" size="3xl">
        Choose Your Recovery Key
      </Text>
      <Text
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Sign in with one of the services below to recover your wallet.
      </Text>

      <Button
        onClick={async () => {
          const keyPair = await getPasskey();

          await recoverByPublicKey.mutateAsync({
            publicKey: keyPair.publicKey,
            keyMetaData: {},
            modifyMultisigKey: (multisigKey) => {
              multisigKey.removeKeyByPublicKey(keyPair.publicKey);
              const primaryKey = multisigKey.addPasskeyKey(keyPair);
              multisigKey.setPrimaryKey(primaryKey);
            },
          });
        }}
        className="block w-full"
        variant="primary"
      >
        Passkey
      </Button>
      <Button
        onClick={() => {
          setModal(KeyType.Phone);
        }}
        className="block w-full"
        variant="primary"
      >
        Phone Key
      </Button>
      <Button
        onClick={() => {
          setModal(KeyType.Telegram);
        }}
        className="block w-full"
        variant="primary"
      >
        Telegram Key
      </Button>
      <Button disabled className="block w-full" variant="primary">
        More Recovery Options Coming Soon
      </Button>

      {renderKeyTypeModal()}
      {renderProxyWalletsModal()}
    </>
  );
});
