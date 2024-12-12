"use client";

import { Text } from "@/components";
import { InfoIcon } from "@/components/info-icon";
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
        <div className="bg-primary flex-col-start self-stretch rounded-[5px] p-2.5">
          <div className="flex-center w-full gap-2">
            <Text className="text-xl-normal text-black">{name}</Text>
            <InfoIcon topicId="dashboard_home" variant="onPrimary" />
          </div>
          <div className="flex-col-start mt-2.5 self-stretch">
            <div className="flex-center">
              <Text className="text-xl-normal text-[#070707]">
                {userData.balanceHidden ? "******" : `$${totalData.total}`}
              </Text>
              {userData.balanceHidden ? (
                <button
                  onClick={() => {
                    return handleHideBalance(false);
                  }}
                  className="balance-toggle-btn"
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
                  className="balance-toggle-btn"
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
