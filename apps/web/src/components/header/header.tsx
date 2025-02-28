"use client";

import { Button, Modal, renderModal, TextButton } from "@/components";
import { PrimaryLink } from "@/components/links";
import { useStore } from "@/contexts";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export const DashboardHeader = observer(function DashboardHeader() {
  const { mpcWalletsStore } = useStore();

  const primaryLinkHref = mpcWalletsStore.currentWallet ? "/dashboard" : "/";
  const authChildren = mpcWalletsStore.currentWallet ? <LogOut /> : <LogIn />;

  return (
    <header className={cn("h-16 w-full", "md:h-20")}>
      <div
        className={cn(
          "flex h-full w-full items-center justify-between bg-transparent px-3 shadow md:px-8",
        )}
      >
        <PrimaryLink href={primaryLinkHref}>
          <Image
            src="/assets/icons/landing-logo.svg"
            width={51}
            height={37.5}
            alt="logo"
          />
        </PrimaryLink>
        {authChildren}
      </div>
    </header>
  );
});

export const Header = observer(function Header() {
  const { mpcWalletsStore } = useStore();
  const pathname = usePathname();

  const primaryLinkHref = mpcWalletsStore.currentWallet ? "/dashboard" : "/";
  const authChildren = mpcWalletsStore.currentWallet ? <LogOut /> : <LogIn />;

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="mb-6 flex items-center justify-between px-6 py-3">
      <div className="flex items-center">
        <PrimaryLink href={primaryLinkHref}>
          <Image
            alt="landing-logo"
            width="68"
            height="50"
            src="/assets/icons/landing-logo.svg"
          />
        </PrimaryLink>
      </div>
      <div className="flex items-center gap-8">
        <nav className="hidden lg:block">
          <ul className="flex items-center space-x-8">
            <li>
              <PrimaryLink
                href="/"
                className={cn(
                  "hover:text-primary relative py-2 text-white",
                  pathname === "/" &&
                    "after:bg-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full",
                )}
              >
                For Users
              </PrimaryLink>
            </li>
            <li>
              <PrimaryLink
                href="/instant-tunnels"
                className={cn(
                  "hover:text-primary relative py-2 text-white",
                  pathname === "/instant-tunnels" &&
                    "after:bg-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full",
                )}
              >
                HyperJump
              </PrimaryLink>
            </li>
            <li>
              <PrimaryLink
                href="/ai-agents"
                className={cn(
                  "hover:text-primary relative py-2 text-white",
                  pathname === "/ai-agents" &&
                    "after:bg-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full",
                )}
              >
                For AI Agents
              </PrimaryLink>
            </li>
          </ul>
        </nav>
        <div className="flex items-center">
          <button
            className="text-2xl text-white lg:hidden"
            onClick={toggleMenu}
          >
            &#9776;
          </button>
          <nav
            className={`${
              menuOpen ? "flex" : "hidden"
            } absolute right-6 top-12 z-10 flex-col space-y-4 bg-[#0a1124] p-4 opacity-90 lg:static lg:flex lg:w-auto lg:flex-row lg:space-x-6 lg:space-y-0 lg:bg-[#070707] lg:p-0`}
          >
            <div className="lg:hidden">
              <PrimaryLink
                href="/"
                className={cn(
                  "hover:text-primary block py-2 text-white",
                  pathname === "/" && "text-primary",
                )}
              >
                For Users
              </PrimaryLink>
              <PrimaryLink
                href="/instant-tunnels"
                className={cn(
                  "hover:text-primary block py-2 text-white",
                  pathname === "/instant-tunnels" && "text-primary",
                )}
              >
                HyperJump
              </PrimaryLink>
              <PrimaryLink
                href="/ai-agents"
                className={cn(
                  "hover:text-primary block py-2 text-white",
                  pathname === "/ai-agents" && "text-primary",
                )}
              >
                For AIs
              </PrimaryLink>
            </div>
            {authChildren}
          </nav>
        </div>
      </div>
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
        Connect
      </TextButton>
      {modalOpen
        ? renderModal(
            <Modal
              title="Select local account"
              onClose={() => {
                return setModalOpen(false);
              }}
              boxClassname="px-3"
            >
              <div className="mt-3 flex flex-col gap-3 pb-3">
                {mpcWalletsStore.wallets.map((wallet, i) => {
                  return (
                    <Button
                      key={i}
                      variant="primary"
                      onClick={() => {
                        mpcWalletsStore.setCurrentWallet(wallet);
                        router.push("/dashboard");
                        setModalOpen(false);
                      }}
                      className="bg-primary border-primary w-full"
                    >
                      <div className="w-full overflow-hidden text-ellipsis text-left">
                        {userDataStore.getUserData(wallet.id).name ||
                          "My Account"}
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
              </div>
            </Modal>,
          )
        : null}
    </>
  );
});
