"use client";

import { Button, ButtonLink, Modal, renderModal, Text } from "@/components";
import { useStore } from "@/contexts";
import { SecretJsHomeChain } from "@/home-chain/secret-js";
import { ProxyWallet, useRecover } from "@/recovery/use-recover";
import { getPasskey, KeyType, ObservableMultisigKey } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const PrimaryKeyStep = observer(function PrimaryKeyStep() {
  const { chainStore } = useStore();
  const [proxyWallets, setProxyWallets] = useState<ProxyWallet[] | null>(null);
  const recover = useRecover();

  const passkeyFlow = useMutation({
    mutationFn: async () => {
      const chainId = chainStore.currentChain;
      const multisigKey = ObservableMultisigKey.create(chainId);
      const keyPair = await getPasskey();
      const primaryKey = multisigKey.addPasskeyKey(keyPair);
      multisigKey.setPrimaryKey(primaryKey);

      const proxyWallets = await new SecretJsHomeChain(
        chainId,
      ).lookupWalletBackup(keyPair.publicKey);

      const wallet = proxyWallets[0];

      if (wallet) {
        multisigKey.setThreshold(parseInt(wallet.owner.threshold, 10));
        wallet.owner.keys.forEach((key) => {
          switch (key.type) {
            case KeyType.Passkey:
              if (
                multisigKey.primaryKey?.publicKey.value !== key.publicKey.value
              ) {
                multisigKey.addPendingRecoveryKey({
                  type: KeyType.Passkey,
                  publicKey: key.publicKey,
                });
              }
              break;
            case KeyType.Phone:
              multisigKey.addPhoneKey(key.publicKey);
              break;
            case KeyType.Telegram:
              multisigKey.addTelegramKey(key.publicKey);
              break;
          }
        });

        await recover({
          multisigKey,
          account: wallet,
        });
      } else {
        setProxyWallets(proxyWallets);
      }
    },
  });

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
        onClick={() => {
          passkeyFlow.mutate();
        }}
        className="block w-full"
        variant="primary"
      >
        <div>Passkey</div>
        {/* TODO: recommendation only makes sense when we have multiple options */}
        {/*<div>(Recommended)</div>*/}
      </Button>
      <Button disabled className="block w-full" variant="primary">
        More Recovery Options Coming Soon
      </Button>

      {renderProxyWalletsModal()}
    </>
  );
});
