"use client";

import { Button, Modal, renderModal } from "@/components";
import { PrimaryLink } from "@/components/links";
import { CURRENT_THEME } from "@/configs";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCircleUser, FaQrcode } from "react-icons/fa6";

export const Header = observer(function Header() {
  const { walletsStore } = useStore();

  const primaryLinkHref = walletsStore.currentWallet ? "/dashboard" : "/";
  const authChildren = walletsStore.currentWallet ? <LogOut /> : <LogIn />;

  const { userDataStore } = useStore();
  const currentWallet = useCurrentWallet({});

  if (!currentWallet) return null;

  const userData = userDataStore.getUserData(currentWallet.address);

  return (
    <>
      <header className="h-20 w-full">
        <div
          className={cn(
            "bg-background-primary flex h-full w-full items-center justify-between px-8 shadow",
            "max-sm:hidden",
          )}
        >
          <PrimaryLink href={primaryLinkHref}>
            {/* <Text
            color="white"
            size="2xl"
            fontWeight="bold"
            className="leading-3"
          >
            Obi
          </Text>
           */}
            <Image src={CURRENT_THEME.logo} width={44} height={44} alt="logo" />
          </PrimaryLink>
          {authChildren}
        </div>
        <div
          className={cn(
            "bg-background-primary flex h-full w-full items-center justify-between p-6 shadow",
            "sm:hidden",
          )}
        >
          <div className="h-11 w-11 rounded-full bg-sky-500">
            {userData.avatar ? (
              <Image
                width={44}
                height={44}
                className="rounded-full"
                src={userData.avatar}
                alt={userData.name as string}
              />
            ) : (
              <FaCircleUser className="h-11 w-11 text-white" />
            )}
          </div>

          <FaQrcode className="h-11 w-11 rounded text-white" />
        </div>
      </header>
    </>
  );
});

const LogOut = observer(function LogOut() {
  const { walletsStore } = useStore();
  const router = useRouter();

  return (
    <Button
      onClick={() => {
        walletsStore.logout();
        router.push("/");
      }}
    >
      Log out
    </Button>
  );
});

const LogIn = observer(function LogIn() {
  const { walletsStore } = useStore();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  function ellipsisString(str: string) {
    if (str.length > 40) {
      return (
        str.substring(0, 20) +
        "..." +
        str.substring(str.length - 20, str.length)
      );
    }
    return str;
  }
  return (
    <>
      <Button
        onClick={() => {
          if (walletsStore.wallets.length > 0) {
            setModalOpen(true);
          } else {
            router.push("/recovery");
          }
        }}
      >
        Log in
      </Button>
      {modalOpen
        ? renderModal(
            <Modal title="Log in">
              {walletsStore.wallets.map((wallet, i) => {
                return (
                  <Button
                    key={i}
                    onClick={() => {
                      walletsStore.setCurrentWallet(wallet);
                      setModalOpen(false);
                    }}
                    className="w-full"
                  >
                    <div className="w-full overflow-hidden text-ellipsis text-left">
                      {wallet.address}
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
