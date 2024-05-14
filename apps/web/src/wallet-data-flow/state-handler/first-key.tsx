"use client";

import { Button, ButtonLink, Modal, renderModal, Text } from "@/components";
import { SecretJsHomeChain } from "@/home-chain/secret-js";
import { AddPhoneKey } from "@/keys/phone/add-phone-key";
import { AddTelegramKey } from "@/keys/phone/add-telegram-key";
import { KeyMetaData } from "@/stores/key-meta-data";
import { LegacyWalletData } from "@/wallet-data-backup";
import { useWalletDataFlowContext } from "@/wallet-data-flow/context";
import {
  getPasskey,
  KeyType,
  MultisigKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const FirstKeyStep = observer(function FirstKeyStep() {
  const { state, dispatch } = useWalletDataFlowContext();
  const [proxyWallets, setProxyWallets] = useState<LegacyWalletData[] | null>(
    null,
  );
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
      const chainId = state.ownerDraft.value.chainId;
      const wallet = await new SecretJsHomeChain(chainId).lookupWalletBackup({
        homeChainId: chainId,
        publicKey,
      });

      if (wallet) {
        dispatch({
          type: "set-wallet-data",
          payload: {
            wallet,
            modifyMultisigKey,
            extraKeyMetaData: keyMetaData,
          },
        });
      } else {
        setProxyWallets([]);
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
    <section className="flex flex-col items-center space-y-7 px-5">
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
    </section>
  );
});
