"use client";

import { Text } from "@/components/text/text";
import { useStore } from "@/contexts";
import { useUsdTotalValue } from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FaCircleUser } from "react-icons/fa6";

export const Account = observer(function Account() {
  const { userDataStore } = useStore();
  const currentWallet = useCurrentWallet({});
  const totalData = useUsdTotalValue();

  if (!currentWallet) return null;

  const userData = userDataStore.getUserData(currentWallet.userEntryAddress);
  const name = userData.name || "My Account";

  return (
    <div className="flex w-full space-x-3 p-3">
      <div className=" h-16 w-16 rounded-full bg-sky-500 ">
        {userData.avatar ? (
          <Image
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover"
            src={userData.avatar}
            alt={name}
          />
        ) : (
          <FaCircleUser className="h-16 w-16 text-white" />
        )}
      </div>
      <div className="flex flex-col justify-around ">
        <Text size="xl" color="white" className="mb-3">
          {name}
        </Text>
        <Text size="3xl" color="white" fontWeight="bold">
          $ {totalData.total}
        </Text>
      </div>
    </div>
  );
});
