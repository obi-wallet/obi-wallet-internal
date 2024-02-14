"use client";

import { Box, Button, Divider, Text } from "@/components";
import { useStore } from "@/contexts";
import { cn } from "@/lib/utils";
import { useQuery } from "@obi-wallet/headless-ui";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export default observer(function AppConnect() {
  const { walletConnectStore } = useStore();
  const [uri, setUri] = useState("");

  const queryClient = useQueryClient();
  const sessions = useQuery({
    queryKey: ["wallet-connect", "sessions"],
    queryFn: async () => {
      return walletConnectStore.getActiveSessions();
    },
    staleTime: 0,
    refetchInterval: 1000,
  });

  const activeSessions = Object.values(sessions.data ?? {}).map((session) => {
    return session;
  });

  return (
    <div className="grid h-full w-full grid-rows-3 gap-4 px-7 py-5 text-white">
      <Box className="ml-2 rounded-md text-xl">
        <Text size="xl">App Connect</Text>
        <Text className="mt-2">
          Navigate to your favorite application and copy the WalletConnect URL.
          Paste the pairing URL below to connect Obi dashboard to the
          application.
        </Text>

        <Divider className="mb-7 mt-5" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void walletConnectStore.pair(uri);
            setUri("");
          }}
        >
          <div className="flex w-full flex-col">
            <div className="relative w-full">
              <label>
                <div className="border-background-select flex flex-row justify-between rounded-xl border bg-transparent p-2 align-middle">
                  <input
                    className={cn(
                      "peer w-full bg-transparent px-2 text-2xl font-normal text-white focus:border-blue-600 focus-visible:outline-none",
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
                  Pairing URL
                </span>
              </label>
            </div>
          </div>
        </form>

        <div className="mt-5">
          {activeSessions.map((session) => {
            return (
              <Button
                className="flex-flex-row my-1 w-full justify-between"
                variant="secondary"
                key={session.topic}
                onClick={async () => {
                  await walletConnectStore.disconnect(session.topic);
                  await queryClient.invalidateQueries([
                    "wallet-connect",
                    "sessions",
                  ]);
                }}
              >
                <Text size="xl">{session.peer.metadata.name}</Text>
                <Text size="sm">Disconnect</Text>
              </Button>
            );
          })}
        </div>
      </Box>
    </div>
  );
});
