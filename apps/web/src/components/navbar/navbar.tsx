"use client";

import { cn } from "@/lib/utils";
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
    href: "/dashboard/fast-travel",
    text: "Fast Travel",
    mobileText: "FT",
    module: "fast-travel",
    icon: "/assets/icons/nav-fast-travel.svg",
    showOnDesktop: true,
    showOnMobile: true,
    mobileOrder: 1,
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

export function Navbar() {
  const pathname = usePathname();
  const mainURISegment = pathname.split("/")[2] || "";

  return (
    <nav className="bg-gradient-to-b from-gray-950 via-gray-900 to-sky-950">
      <div className="flex h-full w-[330px] flex-col px-3 pt-6 max-md:hidden md:overflow-y-auto">
        <div className="hidden w-full flex-col md:flex">
          <Account />
        </div>

        <div className="mt-7 grow">
          <ul role="list" className="flex flex-col space-y-3">
            {navMenu
              .filter((item) => {
                return item.showOnDesktop;
              })
              .map((navItem) => {
                return (
                  <li key={navItem.href}>
                    <PrimaryLink
                      href={navItem.href}
                      className={cn(
                        `flex flex-row px-6 py-2 text-xl font-normal text-white opacity-40 lg:text-2xl ${
                          mainURISegment === navItem.module
                            ? "font-bold opacity-100"
                            : ""
                        }`,
                        "hover:font-bold hover:opacity-100",
                      )}
                      target={navItem.target || "_self"}
                    >
                      <Image
                        src={navItem.icon}
                        width={30}
                        height={30}
                        alt={navItem.text}
                        className="!h-[30px] !w-[30px]"
                      />
                      <Text
                        className="ml-7"
                        fontWeight={
                          mainURISegment === navItem.module ? "bold" : "normal"
                        }
                      >
                        {navItem.text}
                      </Text>
                    </PrimaryLink>
                  </li>
                );
              })}
          </ul>
        </div>
        <Footer className="!px-0" />
      </div>
      <div className="flex h-20 w-full md:hidden">
        <div className="flex w-full flex-row items-center justify-center px-4">
          <ul role="list" className="flex w-full flex-row justify-between p-3">
            {navMenu
              .filter((item) => {
                return item.showOnMobile;
              })
              .sort((itemX, itemY) => {
                return itemX.mobileOrder - itemY.mobileOrder > 0 ? 1 : -1;
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
}

export function AccountAndCTA() {
  return (
    <>
      <Account />
      <div className="mb-4 mt-4 flex gap-5 text-white">
        <Link
          href="/dashboard/transaction/send"
          className="flex flex-1 justify-center rounded-md bg-blue-600 p-3"
        >
          <span className="text-sm">Send</span>
        </Link>
        <Link
          href="/dashboard/transaction/receive"
          className="flex flex-1 justify-center rounded-md bg-blue-600 p-3"
        >
          <span className="text-sm">Receive</span>
        </Link>
      </div>
    </>
  );
}
