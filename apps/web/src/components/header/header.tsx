"use client";

import { Button, Modal, renderModal } from "@/components";
import { PrimaryLink } from "@/components/links";
import { CURRENT_THEME } from "@/configs";
import { useStore } from "@/contexts";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Header = observer(function Header() {
  const { mpcWalletsStore } = useStore();

  const primaryLinkHref = mpcWalletsStore.currentWallet ? "/dashboard" : "/";
  const children = mpcWalletsStore.currentWallet ? <LogOut /> : <LogIn />;

  return (
    <>
      <header className="bg-background-primary flex h-20 items-center justify-between px-8 shadow">
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
        {children}
      </header>
    </>
  );
});

const LogOut = observer(function LogOut() {
  const { mpcWalletsStore } = useStore();

  return (
    <Button
      onClick={() => {
        mpcWalletsStore.logout();
      }}
    >
      Log out
    </Button>
  );
});

const LogIn = observer(function LogIn() {
  const { mpcWalletsStore } = useStore();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          if (mpcWalletsStore.wallets.length > 0) {
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
              {mpcWalletsStore.wallets.map((wallet) => {
                return (
                  <Button
                    key={wallet.userEntryAddress}
                    onClick={() => {
                      mpcWalletsStore.setCurrentWallet(wallet);
                      setModalOpen(false);
                    }}
                    className="w-full"
                  >
                    {wallet.userEntryAddress}
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
