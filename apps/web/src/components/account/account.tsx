"use client";

import { Text } from "@/components";
import { useStore } from "@/contexts";
import { useUsdTotalValue } from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";

export const Account = observer(function Account() {
  const { userDataStore } = useStore();
  const currentWallet = useCurrentWallet();
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
      <div className="flex flex-col gap-2.5">
        <div className="bg-primary flex flex-col items-start justify-start self-stretch rounded-[5px] p-2.5">
          <Text className="font-roboto-mono w-full text-xl font-normal text-black">
            {name}
          </Text>
          <div className="mt-2.5 flex flex-col items-start justify-start self-stretch">
            <Text className="font-roboto-mono text-sm font-normal text-[#070707]">
              Balance
            </Text>
            <div className="flex items-center">
              <Text className="font-roboto-mono self-stretch text-xl font-normal text-[#070707]">
                {userData.balanceHidden ? "******" : `$${totalData.total}`}
              </Text>
              {userData.balanceHidden ? (
                <button
                  onClick={() => {
                    return handleHideBalance(false);
                  }}
                  className="ml-2 text-[#070707] opacity-40 hover:text-blue-600"
                >
                  <img
                    src="/assets/icons/eye-closed.svg"
                    alt="Reveal Balance"
                    className="h-4 w-4"
                  />
                </button>
              ) : (
                <button
                  onClick={() => {
                    return handleHideBalance(true);
                  }}
                  className="ml-2 text-[#070707] opacity-40 hover:text-blue-600"
                >
                  <img
                    src="/assets/icons/eye-open.svg"
                    alt="Hide Balance"
                    className="h-4 w-4"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
