"use client";

import { Button, Modal, TextButton, renderModal } from "@/components";
import { PrimaryLink } from "@/components/links";
import { CURRENT_THEME } from "@/configs";
import { useStore } from "@/contexts";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Header = observer(function Header() {
  const { mpcWalletsStore } = useStore();

  const primaryLinkHref = mpcWalletsStore.currentWallet ? "/dashboard" : "/";
  const authChildren = mpcWalletsStore.currentWallet ? <LogOut /> : <LogIn />;

  return (
    <>
      <header className={cn("h-16 w-full", "md:h-20")}>
        <div
          className={cn(
            "flex h-full w-full  items-center justify-between bg-gradient-to-r from-blue-600 to-blue-900 px-3 shadow md:px-8",
          )}
        >
          <PrimaryLink href={primaryLinkHref}>
            <Image src={CURRENT_THEME.logo} width={44} height={44} alt="logo" />
          </PrimaryLink>
          {authChildren}
        </div>
      </header>
    </>
  );
});

const LogOut = observer(function LogOut() {
  const { mpcWalletsStore } = useStore();
  const router = useRouter();

  return (
    <TextButton
      onClick={() => {
        mpcWalletsStore.logout();
        router.push("/");
      }}
    >
      Log out
    </TextButton>
  );
});

const LogIn = observer(function LogIn() {
  const { mpcWalletsStore, userDataStore } = useStore();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <TextButton
        onClick={() => {
          if (mpcWalletsStore.wallets.length > 0) {
            setModalOpen(true);
          } else {
            router.push("/recovery");
          }
        }}
      >
        Log in
      </TextButton>
      {modalOpen
        ? renderModal(
            <Modal
              title="Log in"
              onClose={() => {
                return setModalOpen(false);
              }}
            >
              {mpcWalletsStore.wallets.map((wallet, i) => {
                return (
                  <Button
                    key={i}
                    onClick={() => {
                      mpcWalletsStore.setCurrentWallet(wallet);
                      setModalOpen(false);
                    }}
                    className="w-full"
                  >
                    <div className="w-full overflow-hidden text-ellipsis text-left">
                      {userDataStore.getUserData(wallet.userEntryAddress)
                        .name || "My Account"}
                    </div>
                  </Button>
                );
              })}
              <Button
                onClick={() => {
                  setModalOpen(false);
                  router.push("/recovery");
                }}
                variant="outline"
                className="w-full"
              >
                Recover other wallet
              </Button>
            </Modal>,
          )
        : null}
    </>
  );
});
