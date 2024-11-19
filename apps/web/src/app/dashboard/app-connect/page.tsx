"use client";

import { Box, Button, Divider, Modal, renderModal, Text } from "@/components";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { cn } from "@/lib/utils";
import { AsyncButton } from "@/ui/button";
import { useQuery } from "@obi-wallet/headless-ui";
import { WalletState } from "@obi-wallet/headless-ui-store";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { useEffectOnceWhen } from "rooks";

export default observer(function AppConnect() {
  const { walletsStoreState } = useStore();
  const currentWallet = useCurrentWallet();
  const router = useRouter();

  const { walletConnectStore } = useStore();
  const searchParams = useSearchParams();
  const [uri, setUri] = useState("");
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  useEffectOnceWhen(() => {
    const uri = searchParams.get("uri");

    if (uri) {
      walletConnectStore.queueUri(uri);
    }
  });

  useEffect(() => {
    if (walletsStoreState !== WalletState.READY) {
      return;
    }

    if (!currentWallet) {
      void router.push("/");
    }
  }, [currentWallet, router, walletsStoreState]);

  const queryClient = useQueryClient();
  const sessions = useQuery({
    queryKey: ["wallet-connect", "sessions"],
    queryFn: async () => {
      return await walletConnectStore.getActiveSessions();
    },
    staleTime: 0,
    refetchInterval: 1000,
  });

  const activeSessions = Object.values(sessions.data ?? {}).map((session) => {
    return session;
  });

  function renderExplanationModal() {
    if (!showExplanationModal) return null;

    return renderModal(
      <Modal title="How to App Connect with Obi">
        <div className="text-ml text-white">
          <ol className="list-inside list-decimal">
            <li className="mb-6">
              Open the app you want to connect to in a browser tab.
            </li>
            <li className="mb-6">
              If you have used a different wallet with this app, you may need to
              disconnect.
            </li>
            <li className="mb-6">
              Find the <strong className="font-bold">WalletConnect</strong>{" "}
              option and display the QR code. In some apps, you may need to
              select <strong className="font-bold">Keplr Mobile</strong> to
              display the code.
              <Image
                className="my-2 w-full object-contain"
                src="/assets/images/app-connect-pairing.png"
                alt="WalletConnect pairing screen"
              />
            </li>
            <li className="mb-6">
              Copy the WalletConnect URL and paste it into the Obi App Connect
              tab.
            </li>
          </ol>
          <div className="mt-5 flex justify-end">
            <Button
              onClick={() => {
                setShowExplanationModal(false);
              }}
              variant="primary"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>,
    );
  }

  return (
    <div className="grid h-full w-full text-white">
      {renderExplanationModal()}
      <Box className="rounded-md text-xl">
        <Text size="xl">App Connect</Text>
        <Text className="mt-2">
          <span className="justify-center align-middle leading-normal">
            Navigate to your favorite app, copy the WalletConnect URL, and paste
            it below to connect it to Obi.
            <div
              className="ml-2 inline-block cursor-pointer"
              onClick={() => {
                setShowExplanationModal(true);
              }}
            >
              <FaQuestionCircle />
            </div>
          </span>
        </Text>

        <Divider className="mb-7 mt-5" />

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await walletConnectStore.pair(uri);
            setUri("");
          }}
        >
          <div className="flex w-full flex-col">
            <div className="relative w-full">
              <label>
                <div className="border-background-select flex flex-row justify-between rounded-xl border bg-transparent p-2 align-middle">
                  <input
                    className={cn(
                      "focus:border-active peer w-full bg-transparent px-2 text-sm font-normal text-white focus-visible:outline-none",
                      "[-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
                    )}
                    value={uri}
                    onChange={(e) => {
                      setUri(e.target.value);
                    }}
                  />
                  <Button type="submit" variant="secondary">
                    Connect
                  </Button>
                </div>

                <span
                  className={cn(
                    "absolute left-0 top-0 ml-5 -translate-y-1/2 px-2 py-1 text-xs text-white",
                    "bg-background-secondary",
                  )}
                >
                  WalletConnect URL
                </span>
              </label>
            </div>
          </div>
        </form>

        <div className="mt-5">
          {activeSessions.map((session) => {
            return (
              <AsyncButton
                className="my-1 w-full justify-between"
                variant="secondary"
                key={session.topic}
                onClick={async () => {
                  await walletConnectStore.disconnect(session.topic);
                  await queryClient.invalidateQueries({
                    queryKey: ["wallet-connect", "sessions"],
                  });
                }}
              >
                <Text size="xl">{session.peer.metadata.name}</Text>
                <Text size="sm">Disconnect</Text>
              </AsyncButton>
            );
          })}
        </div>
      </Box>
    </div>
  );
});
