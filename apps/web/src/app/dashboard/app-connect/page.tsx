"use client";

import { Button, Text } from "@/components";
import { useStore } from "@/contexts";
import { Input } from "@/ui/input";
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
  });

  const activeSessions = Object.values(sessions.data ?? {}).map((session) => {
    return session;
  });

  return (
    <div className="pt-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void walletConnectStore.pair(uri);
        }}
      >
        <Input
          value={uri}
          onChange={setUri}
          label="Pairing URL"
          labelClassname="bg-black"
        />
        <Button type="submit">Scan</Button>
      </form>

      <Text>Connections</Text>
      {activeSessions.length === 0 ? <Text>No active sessions</Text> : null}
      {activeSessions.map((session) => {
        return (
          <div key={session.topic}>
            <Text>{session.topic}</Text>
            <Button
              onClick={async () => {
                await walletConnectStore.disconnect(session.topic);
                await queryClient.invalidateQueries([
                  "wallet-connect",
                  "sessions",
                ]);
              }}
            >
              Disconnect
            </Button>
          </div>
        );
      })}
    </div>
  );

  return null;
});
