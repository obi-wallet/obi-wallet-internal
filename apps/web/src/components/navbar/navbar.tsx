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
    <nav className="bg-background-secondary flex w-full flex-col p-2.5 md:h-full md:w-60 md:overflow-y-auto">
      <div className="hidden h-full w-full flex-col gap-2.5 md:flex">
        {/* Account and CTA */}
        <AccountAndCTA />

        {/* Navigation Menu */}
        <div className="flex flex-1 flex-col items-start justify-start gap-5 py-[5px]">
          <ul role="list" className="flex flex-col space-y-5">
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
                        "flex items-center gap-2.5 rounded-[5px] px-[5px]",
                        mainURISegment === navItem.module ? "bg-accent" : "",
                      )}
                      target={navItem.target || "_self"}
                    >
                      <div className="relative h-8 w-8">
                        <Image
                          src={navItem.icon}
                          width={32}
                          height={32}
                          alt={navItem.text}
                          className="h-8 w-8"
                        />
                      </div>
                      <div className="text-roboto-mono shrink grow basis-0 text-lg font-normal text-white">
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
      <div className="bg-background-secondary fixed bottom-0 left-0 h-20 w-full md:hidden">
        <ul role="list" className="flex w-full justify-between px-4 py-2">
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

export function AccountAndCTA() {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Account Box */}
      <Account />
      {/* Send/Receive Buttons */}
      <div className="flex items-start justify-start gap-2.5 self-stretch">
        <Link
          href="/dashboard/transaction/send"
          className="hover:bg-primary flex h-[31px] shrink grow basis-0 items-center justify-center rounded-[5px] bg-[#353535] p-[5px]"
        >
          <div className="text-roboto-mono text-center text-base font-normal text-white">
            Send
          </div>
        </Link>
        <Link
          href="/dashboard/transaction/receive"
          className="hover:bg-primary flex h-[31px] shrink grow basis-0 items-center justify-center rounded-[5px] bg-[#353535] p-[5px]"
        >
          <div className="text-roboto-mono text-center text-base font-normal text-white">
            Receive
          </div>
        </Link>
      </div>
    </div>
  );
}
