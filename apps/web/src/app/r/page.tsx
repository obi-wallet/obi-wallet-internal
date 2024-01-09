"use client";

import { Text } from "@/components";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";

export default observer(function Dashboard() {
  const currentWallet = useCurrentWallet({
    redirectTo: "/r/onboarding/internal",
  });

  // TODO: show loading spinner or something
  if (!currentWallet) return;

  return (
    <section className="flex w-full flex-col items-center justify-center space-y-9">
      <Text className="text-2xl" leading="normal" fontWeight="bold">
        Dashboard
      </Text>
    </section>
  );
});
