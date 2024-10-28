"use client";

import { Button, Modal, TextButton, renderModal } from "@/components";
import { PrimaryLink } from "@/components/links";
import { useStore } from "@/contexts";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Header = observer(function Header() {
  const { mpcWalletsStore } = useStore();

  const primaryLinkHref = mpcWalletsStore.currentWallet ? "/dashboard" : "/";
  const authChildren = mpcWalletsStore.currentWallet ? <LogOut /> : <LogIn />;

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    //** Deprecated Header */
    /* <header className={cn("h-16 w-full", "md:h-20")}>
        <div
          className={cn(
            "flex h-full w-full items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-800 px-3 shadow md:px-8",
          )}
        >
          <PrimaryLink href={primaryLinkHref}>
            <Image src={CURRENT_THEME.logo} width={44} height={44} alt="logo" />
          </PrimaryLink>
          {authChildren}
        </div>
      </header> */
    <header className="flex items-center justify-between px-6 py-3">
      <PrimaryLink href={primaryLinkHref}>
        <Image
          alt="logo"
          width="68"
          height="50"
          src="https://s3-alpha-sig.figma.com/img/d4f6/d4b9/ccd39a894801a8a40be1f68f010d8f14?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=jf03qZRdF2VGXCi0hgv3JxzG8FDhElboagcfLm~Axet8mn0SaMHYSFmHQeQlq-dIkCDC3FdzXcG6m3VUk10qjWsaJVJ2gmdeOC9dcqoAfuoCmhd2HQPmq-wzc-rH7XjKLr0FMnjZGCx~AumeVyC6tT4LP5SFpQp6njIk4znsDIGDGy5kh2jgMtItu07Oei1z8nHrd7zm3Rku19gWz46rScHuw-2PVTvcrr5TGgChpyj4kaevjf5oUMPm~CxvHu8S4PZEKmjRNuUdz-ytSfGvkHnVzpNvl7yU9rlMiXfX2LeCcia6L36fm5PnvoOvvHqaeDjIyso~kag~elB~HEHFig__"
        />
      </PrimaryLink>
      <button className="text-2xl text-white lg:hidden" onClick={toggleMenu}>
        &#9776;
      </button>
      <nav
        className={`${
          menuOpen ? "flex" : "hidden"
        } lg:bg-background-main absolute right-6 top-12 z-10 flex-col space-y-4 bg-[#0a1124] p-4 opacity-90 lg:static lg:flex lg:w-auto lg:flex-row lg:space-x-6 lg:space-y-0 lg:p-0`}
      >
        <a
          href="#"
          className="flex flex-col text-center text-white hover:text-gray-300"
        >
          For Apps
        </a>
        {authChildren}
      </nav>
    </header>
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
