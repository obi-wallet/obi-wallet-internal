"use client";

import { Button, Text } from "@/components";
import { useStore } from "@/contexts";
import { useUsdTotalValue } from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FaCircleUser, FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

import { PrimaryLink } from "../links";

export const Account = observer(function Account() {
  const { userDataStore } = useStore();
  const currentWallet = useCurrentWallet({});
  const totalData = useUsdTotalValue();

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
      <div className="bg-panel-gradient relative flex w-full flex-col gap-4 rounded-tl-[10px] rounded-tr-[10px] max-sm:bg-none">
        <div className="relative px-4 pb-3.5 pt-1.5">
          <div className="flex justify-end max-md:absolute max-md:right-3.5 max-md:top-1.5">
            <img src="/points.svg" alt="points" className="h-5" />
          </div>
          <div className="flex flex-row gap-3 ">
            <div className="flex h-full max-h-[70px] w-full max-w-[70px] rounded-full  bg-sky-500 max-sm:max-h-[37px] max-sm:max-w-[37px]">
              {userData.avatar ? (
                <Image
                  width={70}
                  height={70}
                  className="h-revertLayer rounded-full object-cover max-sm:h-[37px]"
                  src={userData.avatar}
                  alt={name}
                />
              ) : (
                <FaCircleUser className="h-full w-full text-white" />
              )}
            </div>
            <div className="relative flex w-full flex-col justify-center gap-1">
              <Text
                size="sm"
                color="white"
                fontWeight="bold"
                className="sm:text-xl"
              >
                {name}
              </Text>

              <PrimaryLink
                href="/dashboard/settings/account"
                className="text-sm text-indigo-300 sm:text-xl"
              >
                Edit Profile
              </PrimaryLink>
            </div>
          </div>
        </div>
      </div>

      <div className="">
        <div className="gap-1 bg-slate-900 px-4 pb-3.5 pt-2.5">
          <div className="flex justify-between">
            <Text fontWeight="normal" className=" mb-2 text-sm">
              Balance
            </Text>
            {userData.balanceHidden ? (
              <FaRegEye
                className="h-4 w-4 cursor-pointer text-white opacity-40 hover:text-blue-600"
                onClick={() => {
                  return handleHideBalance(false);
                }}
              />
            ) : (
              <FaRegEyeSlash
                className="h-4 w-4 cursor-pointer text-white opacity-40 hover:text-blue-600"
                onClick={() => {
                  return handleHideBalance(true);
                }}
              />
            )}
          </div>
          <div className="flex items-start gap-1">
            <Text>$</Text>
            <Text size="3xl" color="white" fontWeight="bold">
              {userData.balanceHidden ? "******" : totalData.total}
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
