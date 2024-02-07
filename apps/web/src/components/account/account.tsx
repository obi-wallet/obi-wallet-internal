"use client";

import { Text } from "@/components/text/text";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FaCircleUser } from "react-icons/fa6";

export const Account = observer(function Account() {
  const { userDataStore } = useStore();
  const currentWallet = useCurrentWallet({});

  if (!currentWallet) return null;

  const userData = userDataStore.getUserData(currentWallet.userEntryAddress);

  return (
    <div className="flex w-full space-x-3">
      <div className="h-16 w-16 rounded-full bg-sky-500">
        {userData.avatar ? (
          <Image
            width={64}
            height={64}
            className="rounded-full"
            src={userData.avatar}
            alt={userData.name as string}
          />
        ) : (
          <FaCircleUser className="h-16 w-16 text-white" />
        )}
      </div>
      <div className="flex flex-col justify-around">
        <Text size="xl" color="white">
          My Account
        </Text>
        {/* <Text size="3xl" color="white" fontWeight="bold">
          $6,178.04
        </Text> */}
      </div>
    </div>
  );
});
