"use client";

import { Text } from "@/components";
import { useStore } from "@/contexts";
import { useQuery } from "@obi-wallet/headless-ui";
import { observer } from "mobx-react-lite";

export default observer(function Connections() {
  const { walletConnectStore } = useStore();

  const sessions = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      return walletConnectStore.getActiveSessions();
    },
  });

  console.log(sessions.data);

  return (
    <div className="pt-5">
      <Text>Connections</Text>
    </div>
  );
});
