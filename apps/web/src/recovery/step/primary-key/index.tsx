"use client";

import { Button, ButtonLink, Modal, renderModal, Text } from "@/components";
import { SecretJsHomeChain } from "@/home-chain/secret-js";
import { RecoveryPayload } from "@/recovery/recovery-payload";
import { ProxyWallet, useRecover } from "@/recovery/use-recover";
import { Draft } from "@/stores";
import { getPasskey, KeyType } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const PrimaryKeyStep = observer(function PrimaryKeyStep({
  draft,
}: {
  draft: Draft<RecoveryPayload>;
}) {
  const [proxyWallets, setProxyWallets] = useState<ProxyWallet[] | null>(null);
  const recover = useRecover();

  const passkeyFlow = useMutation({
    mutationFn: async () => {
      const keyPair = await getPasskey();
      await draft.value.setPrimaryKey({
        key: {
          type: KeyType.Passkey,
          payload: keyPair,
        },
      });

      const proxyWallets = await new SecretJsHomeChain(
        draft.value.chainId,
      ).lookupWalletBackup(keyPair.publicKey);
      console.log(proxyWallets);

      const wallet = proxyWallets[0];

      if (wallet) {
        await recover({
          multisigKey: draft.value.multisigKey,
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

    const count = proxyWallets.length;

    return renderModal(
      <Modal title="Existing Wallets">
        <Text color="zinc" size="xs">
          We found {count} {count > 1 ? "wallets" : "wallet"} associated with
          this key.
        </Text>
        {proxyWallets.map((wallet, i) => {
          return (
            <Button
              key={i}
              onClick={async () => {
                await recover({
                  multisigKey: draft.value.multisigKey,
                  account: wallet,
                });
              }}
              className="w-full"
            >
              Recover {wallet.proxyAddress.address}
            </Button>
          );
        })}
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
