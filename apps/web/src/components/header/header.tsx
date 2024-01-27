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
  const { walletsStore } = useStore();

  const primaryLinkHref = walletsStore.currentWallet ? "/dashboard" : "/";
  const children = walletsStore.currentWallet ? <LogOut /> : <LogIn />;

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
  const { walletsStore } = useStore();

  return (
    <Button
      onClick={() => {
        walletsStore.logout();
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
                    {wallet.address}
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
