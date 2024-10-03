"use client";

import { Notification } from "@/components";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

export const OnekeyNotification = observer(function PasskeyNotification() {
  const currentWallet = useCurrentWallet({});
  const isOnlyOneKey = currentWallet && currentWallet.owner.keys.length === 1;
  const router = useRouter();

  if (!isOnlyOneKey) return null;

  return (
    <Notification
      description={`Caution: Your account is currently only secured by your ${currentWallet.owner.keys[0]?.type === "passkey" ? currentWallet.owner.keys[0]?.type : currentWallet.owner.keys[0]?.type + "key"}. Please add one or more <b>recovery keys</b>.`}
      type="warning"
      onClick={() => {
        router.push("/dashboard/settings/security");
      }}
    />
  );
});
