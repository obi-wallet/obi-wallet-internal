"use client";

import { Text } from "@/components/text/text";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import { FaCircleUser } from "react-icons/fa6";

export const Account = observer(function Account() {
  const { userDataStore } = useStore();
  const currentWallet = useCurrentWallet({});

  if (!currentWallet) return null;

  const userData = userDataStore.getUserData(currentWallet.address);

  return (
    <div className="flex  space-x-7">
      {/* <div className="h-28 w-28 rounded-full bg-sky-500"></div> */}
      {/* TODO: actually show avatar */}
      {userData.avatar ? (
        <div>TODO</div>
      ) : (
        <FaCircleUser className="h-28 w-28 text-white" />
      )}
      <div className="flex flex-col justify-around">
        <Text size="2xl" color="white">
          {userData.name ?? "My Account"}
        </Text>
        <Text size="3xl" color="white" fontWeight="bold">
          $6,178.04
        </Text>
      </div>
    </div>
  );
});
