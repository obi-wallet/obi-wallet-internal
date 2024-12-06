"use client";

import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Account, Footer, PrimaryLink, Text } from "..";

interface NavMenu {
  href: string;
  text: string;
  mobileText?: string;
  module: string;
  icon: string;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  target?: string;
  mobileOrder: number;
}

const navMenu: NavMenu[] = [
  {
    href: "/dashboard/transaction/send",
    text: "Transact",
    module: "",
    icon: "/assets/icons/nav-transact.svg",
    showOnMobile: false,
    showOnDesktop: false,
    mobileOrder: 0,
  },
  {
    href: "/dashboard",
    text: "Home",
    module: "",
    icon: "/assets/icons/navbar-home.svg",
    showOnMobile: true,
    showOnDesktop: true,
    mobileOrder: 3,
  },
  {
    href: "/dashboard/buy-crypto",
    mobileText: "Buy",
    text: "Buy Crypto",
    module: "buy-crypto",
    icon: "/assets/icons/navbar-card.svg",
    showOnDesktop: true,
    showOnMobile: true,
    mobileOrder: 2,
  },
  {
    href: "/dashboard/settings/security",
    text: "Security",
    module: "settings",
    icon: "/assets/icons/navbar-settings.svg",
    showOnMobile: true,
    showOnDesktop: true,
    mobileOrder: 5,
  },
  {
    href: "/dashboard/app-connect",
    text: "App Connect",
    mobileText: "Apps",
    module: "app-connect",
    icon: "/assets/icons/navbar-appconnect.svg",
    showOnDesktop: true,
    showOnMobile: true,
    mobileOrder: 4,
  },
  // {
  //   href: "",
  //   text: "Extra Life (soon)",
  //   module: "extra-life",
  //   icon: "/assets/icons/nav-extra-life.svg",
  //   showOnMobile: false,
  //   showOnDesktop: true,
  //   mobileOrder: 5,
  // },
];

export const Navbar = observer(function Navbar() {
  const pathname = usePathname();
  const mainURISegment = pathname.split("/")[2] || "";

  return (
    <nav className="bg-background-secondary lg:flex lg:h-full lg:w-60 lg:max-w-60 lg:flex-col lg:overflow-y-auto lg:p-2.5">
      <div className="max-lg:hidden lg:flex lg:h-full lg:w-full lg:flex-col lg:gap-2.5">
        {/* Account and CTA */}
        <AccountAndCTA />

        {/* Navigation Menu */}
        <div className="flex flex-1 flex-col items-start justify-start gap-5">
          <ul role="list" className="flex w-full flex-col space-y-5">
            {navMenu
              .filter((item) => {
                return item.showOnDesktop;
              })
              .map((navItem) => {
                return (
                  <li key={navItem.href} className="self-stretch">
                    <PrimaryLink
                      href={navItem.href}
                      className={cn(
                        "h-standardButton flex w-full items-center gap-2.5 rounded-[5px] px-[5px]",
                        mainURISegment === navItem.module ? "bg-primary" : "",
                      )}
                      target={navItem.target || "_self"}
                    >
                      <div className="relative h-8 w-8">
                        <Image
                          src={navItem.icon}
                          width={32}
                          height={32}
                          alt={navItem.text}
                          className={cn(
                            "h-8 w-8",
                            mainURISegment === navItem.module
                              ? "brightness-0"
                              : "",
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          "text-md shrink grow basis-0 font-normal",
                          mainURISegment === navItem.module
                            ? "text-black"
                            : "text-white",
                        )}
                      >
                        {navItem.text}
                      </div>
                    </PrimaryLink>
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Footer */}
        <Footer className="!px-0" />
      </div>

      {/* Mobile Navigation */}
      <div className="bg-background-secondary fixed bottom-0 left-0 z-[9999] h-20 w-full shadow-lg lg:hidden">
        <div className="bg-background-secondary absolute inset-0"></div>
        <ul
          role="list"
          className="relative flex w-full justify-between px-4 py-2"
        >
          {navMenu
            .filter((item) => {
              return item.showOnMobile;
            })
            .sort((a, b) => {
              return a.mobileOrder - b.mobileOrder;
            })
            .map((navItem, index) => {
              return (
                <li key={`navmenu-${index}`} className="flex-1">
                  <PrimaryLink
                    href={navItem.href}
                    className={cn(
                      "flex flex-col items-center justify-center",
                      mainURISegment !== navItem.module && "opacity-60",
                    )}
                  >
                    <Image
                      src={navItem.icon}
                      height={30}
                      width={30}
                      alt={navItem.text}
                    />
                    <Text className="text-center text-xs">
                      {navItem.mobileText ?? navItem.text}
                    </Text>
                  </PrimaryLink>
                </li>
              );
            })}
        </ul>
      </div>
    </nav>
  );
});

export function AccountAndCTA({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {/* Account Box */}
      <Account />
      {/* Send/Receive Buttons */}
      <div className="flex items-start justify-start gap-2.5 self-stretch">
        <Link
          href="/dashboard/transaction/send"
          className="hover:bg-primary flex h-[31px] shrink grow basis-0 items-center justify-center rounded-[5px] bg-[#353535] p-[5px] text-white hover:text-black"
        >
          <div className="text-center text-base font-normal">Send</div>
        </Link>
        <Link
          href="/dashboard/transaction/receive"
          className="hover:bg-primary flex h-[31px] shrink grow basis-0 items-center justify-center rounded-[5px] bg-[#353535] p-[5px] text-white hover:text-black"
        >
          <div className="text-center text-base font-normal">Receive</div>
        </Link>
      </div>
    </div>
  );
}
