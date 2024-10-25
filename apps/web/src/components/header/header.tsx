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

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      //** Deprecated Header */
      {/* <header className={cn("h-16 w-full", "md:h-20")}>
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
      </header> */}
      <header className="flex justify-between items-center py-3 px-6">        
        <PrimaryLink href={primaryLinkHref}>
          <svg width="68" height="50" viewBox="0 0 68 50" fill="none" xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink">
            <rect width="68" height="50" fill="url(#pattern0_6561_2785)"/>
            <defs>
            <pattern id="pattern0_6561_2785" patternContentUnits="objectBoundingBox" width="1" height="1">
            <use xlinkHref="#image0_6561_2785" transform="matrix(0.00483092 0 0 0.00657005 0 -0.0026087)"/>
            </pattern>
            <image id="image0_6561_2785" width="207" height="153" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM8AAACZCAYAAACIVm61AAAACXBIWXMAAAsSAAALEgHS3X78AAAEQklEQVR4nO3d0XHbRhQF0FXGBaQEl5AODHXiEtxBoE5YCtyBSmAJ6kD5iDIDIRgSvFgsAeqcGXxwCCyWz77iLp+Genp/fy/A7f649wTgqIQHQsIDIeGBkPBASHggJDwQEh4ICQ+EhAdCwgMh4YGQ8EBIeCAkPBASHggJD4SEB0LCAyHhgZDwQEh4ICQ8EBIeCAkPhIQHQsIDIeGBkPBASHggJDwQEh4ICQ+EvlUYo6swxt4NG4zZbTDmJeeP45F0je/3Wkp5++/BU4U/q/gV/i7j0wZjtq7bSymlb3zPrbWu4XMZ/SC1bIOQ8EBIeCBU4wOD5wpjfEWt63ZufL8WWtfwdfygxgcG8CVZtkFIeCC0JDzvjqtHovUc+3Cee9a6ht345t55ICQ8EBIeCC3p8+jjbEOfZz19HjgiyzYICQ+E5sJz757JIxxLtJ5TP7n/sJM61FR7/t2lm3nngZDwQEh4IDTX59HXaePefZ5fpZQ/G89ha7Vr+nrpSX0eCFm2QUh4IDS35xkaz+H0cWzl58fRUrfgnGHjORxRt/L6ocIcxn6VC/ueufD8qDyBa4aNx/9e2r+mJfY4p6OrXdOLH6hYtkFIeCA0t2x7aTyH4eDjp1rX+SuoXdPzpSf1eSBk2QYh4YGQPs82ugXnDBvP4RF0V54fGsxh7FPfR5/nfvY4p6NpXcNPfR/LNggJD4T0ee5Hn2e91jU8jx/o80DIsg1CwgMhfZ5tdAvOGTaew9SprKvzz7K/Og4N5jCmz7MTR6vz97K/OurzwBEJD4T0ee7naHVee/0W9HngiCzbICQ8EJrb8/SN5zCUbdfTXVn/fWC36iudU9NQ1tW5K/ur47XnazuV0b5nbs/TehP0UrYtQl9K+XvD8ec8LTjnaHXuy/7q2LqGz2X0A8iyDULCA6G5Pc/vxnM4Nxi/9Wta4mh1Ppf91bH1fN7GD/R5IGTZBiHhgdAe+jxTQzleP2Kqr3ROTUM5Xl37lc/Xdio76/NMHbEfMaXPU4c+Dzwi4YHQHvo8U+cK19/7NSyhz7OePg8ckWUbhIQHQnN7nql+60k8gL7RNY+u3/j8tU7lSp9nyqbouiV9nSl1/b9b66jPA0ckPBASHgjp80DIOw+EhAdCS/o8U13tSRzQUGGMrsIYRzesvL6rMIdbvJbR77clex6bpKyvM6WO6+uozwNHJDwQEh4I6fNAyDsPhIQHQkmf51Z/lcmf4N6Zt/Lv5/f31q28/lw+f09B67rvoY5d5fE+9XWmWux5hlLKj61vssLvso+G5dp/iOn3sg2lbd33UMfa/5k/9XWmLNsgJDwQEh4I6fNAyDsPhIQHQsIDIeGBkPBASHggJDwQEh4ICQ+EhAdCwgMh4YGQ8EBIeCAkPBASHggJD4SEB0LCAyHhgZDwQEh4ICQ8EBIeCAkPhIQHQsIDIeGBkPBASHggJDwQEh4I/QOcptyXHCaaFgAAAABJRU5ErkJggg=="/>
            </defs>
          </svg>
        </PrimaryLink>
        <button className="lg:hidden text-2xl text-white" onClick={toggleMenu}>&#9776;</button>
        <nav
          className={`${
            menuOpen ? 'flex' : 'hidden'
          } lg:flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6 absolute lg:static top-12 right-6 lg:w-auto lg:bg-background-main bg-[#0a1124] opacity-90 p-4 lg:p-0 z-10`}
        >
          <a href="#" className="text-center text-white flex flex-col hover:text-gray-300">
            For Apps
          </a>
          {authChildren}
        </nav>
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
