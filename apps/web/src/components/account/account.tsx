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
      {userData.avatar ? (
        <div className="h-28 w-28 rounded-full bg-sky-500">
          <img className="h-28 w-28 rounded-full" src={userData.avatar} />
        </div>
      ) : (
        <FaCircleUser className="h-28 w-28 text-white" />
      )}
      <div className="flex flex-col justify-around">
        <Text size="2xl" color="white">
          {userData.name ?? "My Account"}
        </Text>
        {/* <Text size="3xl" color="white" fontWeight="bold">
          $6,178.04
        </Text> */}
      </div>
    </div>
  );
});
