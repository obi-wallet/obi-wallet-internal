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
    icon: "/assets/icons/nav-home.svg",
    showOnMobile: true,
    showOnDesktop: true,
    mobileOrder: 3,
  },
  {
    href: "/dashboard/buy-crypto",
    mobileText: "Buy",
    text: "Buy Crypto",
    module: "buy-crypto",
    icon: "/assets/icons/nav-buy-crypto.svg",
    showOnDesktop: true,
    showOnMobile: true,
    mobileOrder: 2,
  },
  {
    href: "/dashboard/settings/security",
    text: "Security",
    module: "settings",
    icon: "/assets/icons/nav-settings.svg",
    showOnMobile: true,
    showOnDesktop: true,
    mobileOrder: 5,
  },
  {
    href: "/dashboard/app-connect",
    text: "App Connect",
    mobileText: "Apps",
    module: "app-connect",
    icon: "/assets/icons/nav-app-connect.svg",
    showOnDesktop: true,
    showOnMobile: true,
    mobileOrder: 4,
  },
  {
    href: "",
    text: "Extra Life (soon)",
    module: "extra-life",
    icon: "/assets/icons/nav-extra-life.svg",
    showOnMobile: false,
    showOnDesktop: true,
    mobileOrder: 5,
  },
];

export const Navbar = observer(function Navbar() {
  const pathname = usePathname();
  const mainURISegment = pathname.split("/")[2] || "";

  return (
    <nav className="bg-background-secondary flex h-full w-60 flex-col p-2.5 max-md:hidden md:overflow-y-auto">
      <div className="flex w-full flex-col gap-2.5">
        {/* Account and CTA */}
        <AccountAndCTA />

        {/* Navigation Menu */}
        <div className="flex flex-col items-start justify-start gap-5 py-[5px]">
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
                      <div className="font-roboto-mono shrink grow basis-0 text-xl font-normal text-white">
                        {navItem.text}
                      </div>
                    </PrimaryLink>
                  </li>
                );
              })}
          </ul>
        </div>
        <Footer className="!px-0" />
      </div>

      {/* Mobile Navigation */}
      <div className="flex h-20 w-full md:hidden">
        <div className="flex w-full flex-row items-center justify-center px-4">
          <ul role="list" className="flex w-full flex-row justify-between p-3">
            {navMenu
              .filter((item) => {
                return item.showOnMobile;
              })
              .sort((a, b) => {
                return a.mobileOrder - b.mobileOrder;
              })
              .map((navItem, index) => {
                return (
                  <li key={`navmenu-${index}`}>
                    <PrimaryLink
                      href={navItem.href}
                      className={cn(
                        "flex flex-col items-center justify-center space-y-3",
                        mainURISegment !== navItem.module && "opacity-60",
                      )}
                    >
                      <Image
                        src={navItem.icon}
                        height={30}
                        width={30}
                        alt={navItem.text}
                        className="!h-[30px] !w-[30px]"
                      />
                      <Text className="text-center">
                        {navItem.mobileText ?? navItem.text}
                      </Text>
                    </PrimaryLink>
                  </li>
                );
              })}
          </ul>
        </div>
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
          className="flex h-[31px] shrink grow basis-0 items-center justify-center rounded-[5px] bg-[#353535] p-[5px]"
        >
          <div className="font-roboto-mono text-center text-base font-normal text-white">
            Send
          </div>
        </Link>
        <Link
          href="/dashboard/transaction/receive"
          className="flex h-[31px] shrink grow basis-0 items-center justify-center rounded-[5px] bg-[#353535] p-[5px]"
        >
          <div className="font-roboto-mono text-center text-base font-normal text-white">
            Receive
          </div>
        </Link>
      </div>
    </div>
  );
}
