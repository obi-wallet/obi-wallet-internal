"use client";

import { Button, Modal, renderModal, Text } from "@/components";
import { PrimaryKeyOnboardingStep } from "@/onboarding";
import { ProxyWallet } from "@/onboarding/onboarding-payload";
import { StepProps } from "@/onboarding/step";
import { getOrCreatePasskey, KeyType, Sdk } from "@obi-wallet/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const PrimaryKeyStep = observer(function PrimaryKeyStep({
  draft,
  back,
  next,
}: StepProps<PrimaryKeyOnboardingStep>) {
  const queryClient = useQueryClient();
  const [proxyWallets, setProxyWallets] = useState<ProxyWallet[] | null>(null);

  async function passkeyFlow() {
    const result = await getOrCreatePasskey();
    if (!result.success) return result;

    const { keyPair } = result;
    await draft.value.setPrimaryKey({
      key: {
        type: KeyType.Device,
        payload: keyPair,
      },
    });

    const proxyWallets = await draft.value.lookupProxyWallets(
      keyPair.publicKey,
    );
    await queryClient.prefetchQuery(
      Sdk.chainId(draft.value.chainId).transactions.prepareKeyPairQuery(
        keyPair,
      ),
    );
    setProxyWallets(proxyWallets);

    // TODO:
    // if (next) next();
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
              void draft.value.createMagicAccount();
              if (next) next();
            }}
            variant="primary"
            className="w-full"
          >
            Create a new wallet
          </Button>
          <Button
            onClick={() => {
              // TODO:
              window.alert("Recovery not implemented yet");
            }}
            variant="outline"
            className="w-full"
          >
            Recover another wallet
          </Button>
        </Modal>,
      );
    }

    return renderModal(
      <Modal title="Existing Wallets">
        <Text color="zinc" size="xs">
          We found {proxyWallets.length} wallets associated with this key.
        </Text>
        {proxyWallets.map((wallet, i) => {
          return (
            <Button
              key={i}
              onClick={() => {
                // TODO: recover wallet
                window.alert("Wallet recovery not implemented yet");
              }}
              className="w-full"
            >
              Recover {wallet.proxyAddress.address}
            </Button>
          );
        })}
        <Button
          onClick={() => {
            void draft.value.createMagicAccount();
            if (next) next();
          }}
          variant="outline"
          className="w-full"
        >
          Create a new wallet
        </Button>
      </Modal>,
    );
  }

  return (
    <>
      <Text fontWeight="bold" size="3xl">
        Create Your First Key
      </Text>
      <Text
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Sign in with one of the services below to create your first key.
      </Text>

      <Button
        onClick={() => {
          void passkeyFlow();
        }}
        className="block w-full"
        variant="primary"
      >
        <div>Passkey</div>
        {/* TODO: recommendation only makes sense when we have multiple options */}
        {/*<div>(Recommended)</div>*/}
      </Button>
      <Button disabled className="block w-full" variant="primary">
        More Services Coming Soon
      </Button>

      {/* TODO: cloud keys aren't integrated yet */}
      {/*<div className="flex w-full items-center">*/}
      {/*  <div className="h-0.5 w-full rounded-lg bg-gray-600" />*/}
      {/*  <Text className="grow-0 px-3" color="gray">*/}
      {/*    OR*/}
      {/*  </Text>*/}
      {/*  <div className="h-0.5 w-full rounded-lg bg-gray-600" />*/}
      {/*</div>*/}

      {/*<div className="flex w-full flex-row justify-around">*/}
      {/*  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">*/}
      {/*    <FaApple className="h-9 w-9 text-white" />*/}
      {/*  </div>*/}
      {/*  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">*/}
      {/*    <FaGoogle className="h-7 w-7 text-white" />*/}
      {/*  </div>*/}
      {/*  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">*/}
      {/*    <FaWindows className="h-7 w-7 text-white" />*/}
      {/*  </div>*/}
      {/*</div>*/}

      {back ? (
        <Button onClick={back} className="block w-full" variant="outline">
          Back
        </Button>
      ) : null}

      {renderProxyWalletsModal()}
    </>
  );
});
