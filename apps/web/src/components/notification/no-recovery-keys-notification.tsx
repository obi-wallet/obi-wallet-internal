"use client";

import { Notification } from "@/components";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { KeyType } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

export const NoRecoveryKeysNotification = observer(
  function PasskeyNotification() {
    const currentWallet = useCurrentWallet();
    const hasOnlyPrimaryKey =
      currentWallet && currentWallet.owner.keys.length === 1;
    const router = useRouter();

    if (!hasOnlyPrimaryKey) return null;

    const getLabel = () => {
      switch (currentWallet.owner.keys[0]?.type) {
        case KeyType.Passkey:
          return "passkey";
        case KeyType.Cloud:
          return "cloud key";
      }
    };

    return (
      <Notification
        description={`Caution: Your account is only secured by your ${getLabel()}. Please add one or more <b>recovery keys</b>.`}
        type="warning"
        onClick={() => {
          router.push("/dashboard/settings/security");
        }}
      />
    );
  },
);
