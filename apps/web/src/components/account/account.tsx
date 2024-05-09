"use client";

import { Text, Button } from "@/components";
import { useStore } from "@/contexts";
import { useUSDTotalPrice } from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FaCircleUser, FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

import { PrimaryLink } from "../links";

export const Account = observer(function Account() {
  const { userDataStore } = useStore();
  const currentWallet = useCurrentWallet({});
  const totalData = useUSDTotalPrice();

  if (!currentWallet) return null;

  const userData = userDataStore.getUserData(currentWallet.userEntryAddress);
  const name = userData.name || "My Account";

  const handleHideBalance = (hide: boolean) => {
    userDataStore.setUserData(currentWallet.userEntryAddress, {
      ...userData,
      balanceHidden: hide,
    });
  };

  return (
    <>
      <div className="relative flex w-full flex-col gap-4 rounded-tl-[10px] rounded-tr-[10px] bg-gradient-to-r from-[#333333] to-[#1B1B1B]">
        <div className="flex flex-row gap-3 px-4 py-3.5">
          <div className="h-[70px] w-[70px] rounded-full bg-sky-500 ">
            {userData.avatar ? (
              <Image
                width={70}
                height={70}
                className="h-[70px] w-[70px] rounded-full object-cover"
                src={userData.avatar}
                alt={name}
              />
            ) : (
              <FaCircleUser className="h-[70px] w-[70px] text-white" />
            )}
          </div>
          <div className="flex flex-col justify-center gap-1">
            <Text size="xl" color="white" fontWeight="bold">
              {name}
            </Text>

            <PrimaryLink
              href="/dashboard/settings/account"
              className="text-indigo-300"
            >
              Edit Profile
            </PrimaryLink>
          </div>
        </div>
      </div>

      <div className="">
        <div className="gap-1 bg-slate-900 px-4 pb-3.5 pt-2.5">
          <div className="flex justify-between">
            <Text fontWeight="normal">Balance</Text>
            {userData.balanceHidden ? (
              <FaRegEye
                className="h-4 w-4 cursor-pointer text-white opacity-40 hover:text-blue-600"
                onClick={() => {return handleHideBalance(false)}}
              />
            ) : (
              <FaRegEyeSlash
                className="h-4 w-4 cursor-pointer text-white opacity-40 hover:text-blue-600"
                onClick={() => {return handleHideBalance(true)}}
              />
            )}
          </div>
          <div className="flex items-start gap-1">
            <Text>$</Text>
            <Text size="3xl" color="white" fontWeight="bold">
              {userData.balanceHidden
                ? "******"
                : totalData.loading
                  ? 0
                  : totalData.total}
            </Text>
          </div>
        </div>
        <div className="mb-4 mt-0.5 flex gap-1 text-white">
          <Button
            href="/dashboard/transaction/send"
            className="flex-1 justify-center rounded-bl rounded-br rounded-tl-none rounded-tr-none border-0 bg-gradient-to-r from-blue-500 to-indigo-500 p-2 text-center hover:from-blue-700 hover:to-blue-900"
          >
            Send
          </Button>
          <Button
            href="/dashboard/transaction/receive"
            className="flex-1 justify-center rounded-bl rounded-br rounded-tl-none rounded-tr-none border-0 bg-gradient-to-r from-indigo-500 to-blue-700 p-2 hover:from-blue-900 hover:to-blue-900"
          >
            Receive
          </Button>
        </div>
      </div>
    </>
  );
});
