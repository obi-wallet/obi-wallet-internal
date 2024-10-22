"use client";

import { Button, ButtonLink, Modal, renderModal, Text } from "@/components";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { AddPhoneKey } from "@/keys/phone/add-phone-key";
import { AddTelegramKey } from "@/keys/phone/add-telegram-key";
import { AsyncButton } from "@/ui/button";
import {
  WalletDataFlowInitialState,
  WalletDataFlowState,
} from "@/wallet-data-flow-new/state";
import { getPasskey, KeyType, Secp256k1PublicKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export interface FirstKeyStepProps {
  state: WalletDataFlowInitialState;
  onChooseKey: (publicKey: Secp256k1PublicKey) => Promise<WalletDataFlowState>;
}

export const FirstKeyStep = observer<FirstKeyStepProps>(function FirstKeyStep({
  state,
  onChooseKey,
}) {
  const [noWalletsFoundModal, setNoWalletsFoundModal] =
    useState<boolean>(false);
  const [modal, setModal] = useState<KeyType | null>(null);
  const [cloudKeyFiles, setCloudKeyFiles] = useState<
    { id: string; name: string }[] | null
  >(null);
  const { readFiles, readFileById } = useGoogleAuth();

  async function setKey(publicKey: Secp256k1PublicKey) {
    const nextState = await onChooseKey(publicKey);
    if (state.type === nextState.type) {
      setNoWalletsFoundModal(true);
    }
  }

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
              // TODO: handle extra keyMetaData
              await setKey(publicKey);
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
              // TODO: handle extra keyMetaData
              await setKey(publicKey);
            }}
            onCancel={onClose}
            askForName={false}
          />
        </Modal>
      );
    }

    if (modal === KeyType.Cloud) {
      return (
        <Modal
          title="Cloud Key"
          boxClassname="h-fit w-2/5 !w-[320px] !min-w-[320px] px-4 py-6 max-sm:w-full overflow-y-auto max-h-[400px]"
          onClose={onClose}
        >
          <section className="flex flex-col items-center space-y-4">
            {cloudKeyFiles?.map((file, index) => {
              return (
                <AsyncButton
                  key={index}
                  onClick={async () => {
                    const keyPair = await readFileById(file.id);
                    if (keyPair) {
                      await setKey(keyPair.publicKey);
                    }
                  }}
                  className="block w-full"
                  variant="primary"
                >
                  {file.name}
                </AsyncButton>
              );
            })}
          </section>
        </Modal>
      );
    }
  }

  function renderProxyWalletsModal() {
    if (noWalletsFoundModal) {
      return renderModal(
        <Modal title="Existing Wallets">
          <Text color="zinc" size="xs">
            We found no wallets associated with this key. Would you like to
            create a new wallet?
          </Text>
          <Button
            onClick={() => {
              setNoWalletsFoundModal(false);
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

      <AsyncButton
        onClick={async () => {
          const keyPair = await getPasskey();
          await setKey(keyPair.publicKey);
        }}
        className="block w-full"
        variant="primary"
      >
        Passkey
      </AsyncButton>
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
      <AsyncButton
        onClick={async () => {
          const files = await readFiles();
          const keyFiles =
            files &&
            files
              .filter((file) => {
                return file.name.startsWith("obi-");
              })
              .filter((file) => {
                return file.name.endsWith(".key");
              });
          if (keyFiles) {
            setCloudKeyFiles(keyFiles);
            setModal(KeyType.Cloud);
          }
        }}
        className="block w-full"
        variant="primary"
      >
        Cloud Key
      </AsyncButton>
      <Button disabled className="block w-full" variant="primary">
        More Recovery Options Coming Soon
      </Button>

      {renderKeyTypeModal()}
      {renderProxyWalletsModal()}
    </section>
  );
});
