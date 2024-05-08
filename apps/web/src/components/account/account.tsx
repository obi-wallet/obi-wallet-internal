"use client";

import { Text, Button } from "@/components";
import { useStore } from "@/contexts";
import { useUSDTotalPrice } from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FaCircleUser, FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { PrimaryLink } from "../links";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const Account = observer(function Account() {
  const { userDataStore } = useStore();
  const currentWallet = useCurrentWallet({});
  const totalData = useUSDTotalPrice();

  if (!currentWallet) return null;

  const userData = userDataStore.getUserData(currentWallet.userEntryAddress);
  const name = userData.name || "My Account";

  return (
    <div className="relative flex w-full flex-col gap-4 rounded-xl bg-gradient-to-r from-[#333333] to-[#1B1B1B] px-4 py-3">
      <div className="flex flex-row gap-3">
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
      <div className="rounded">
        <div className="gap-1 rounded-tl rounded-tr bg-slate-900 px-3 py-2">
          <div className="flex justify-between">
            <Text fontWeight="normal">Balance</Text>
            <FaRegEye className="h-4 w-4" color="white" />
          </div>
          <div className="flex items-start gap-1">
            <Text>$</Text>
            <Text size="3xl" color="white" fontWeight="bold">
              {totalData.loading ? 0 : totalData.total}
            </Text>
          </div>
        </div>
        <div className="mb-4 mt-0.5 flex gap-1 text-white">
          <Button
            href="/dashboard/transaction/send"
            className="flex-1 justify-center rounded-bl rounded-br rounded-tl-none rounded-tr-none border-0 bg-gradient-to-r from-blue-600 to-blue-800 p-3 text-center hover:from-blue-700 hover:to-blue-900"
          >
            Send
          </Button>
          <Button
            href="/dashboard/transaction/receive"
            className="hover:to-blue flex-1 justify-center rounded-bl rounded-br rounded-tl-none rounded-tr-none border-0 bg-gradient-to-r from-blue-800 to-blue-900 p-3 hover:from-blue-900"
          >
            Receive
          </Button>
        </div>
      </div>
    </div>
  );
});
