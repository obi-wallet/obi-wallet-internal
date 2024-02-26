"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Account, Footer, PrimaryLink, RainbowDivider, Text } from "..";

type NavMenu = {
  href: string;
  text: string;
  mobileText?: string;
  module: string;
  icon: string;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  target?: string;
  mobileOrder: number;
};
const navMenu: NavMenu[] = [
  {
    href: "/dashboard/transaction/send",
    text: "Transact",
    module: "transaction",
    icon: "/assets/icons/nav-transact.svg",
    showOnMobile: true,
    showOnDesktop: false,
    mobileOrder: 1,
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
    href: "/dashboard/settings",
    text: "Settings",
    module: "settings",
    icon: "/assets/icons/nav-settings.svg",
    showOnMobile: true,
    showOnDesktop: true,
    mobileOrder: 5,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const mainURISegment = pathname.split("/")[2] || "";

  return (
    <nav className="bg-background-secondary relative max-sm:absolute max-sm:bottom-0 max-sm:h-24 max-sm:w-full sm:h-full">
      <div className="flex h-full w-[330px] flex-col px-7 pt-16 max-md:hidden">
        <Account />
        <div className="my-7 flex gap-5 text-white">
          <Link
            href="/dashboard/transaction/send"
            className="bg-background-primary flex  flex-1 justify-center rounded-md p-3"
          >
            <span className="text-sm">Send</span>
          </Link>
          <Link
            href="/dashboard/transaction/receive"
            className="bg-background-primary flex  flex-1 justify-center rounded-md p-3"
          >
            <span className="text-sm">Receive</span>
          </Link>
        </div>
        <RainbowDivider className="h-[2px]" />

        <div className="mt-7 grow">
          <ul role="list" className="flex flex-col space-y-3">
            {navMenu
              .filter((item) => item.showOnDesktop)
              .map((navItem, index) => (
                <li key={`navmenu-${index}`}>
                  <PrimaryLink
                    href={navItem.href}
                    className={`flex flex-row px-6 py-2 text-xl font-normal text-white lg:text-2xl ${
                      mainURISegment === navItem.module
                        ? "bg-background-select rounded-md font-bold"
                        : ""
                    }`}
                    target={navItem.target || "_self"}
                  >
                    <Image
                      src={navItem.icon}
                      width={30}
                      height={30}
                      alt={navItem.text}
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
              ))}
          </ul>
        </div>
        <Footer className="!px-0" />
      </div>
      <div className="flex h-full w-full flex-col md:hidden">
        <RainbowDivider />

        <div className="flex h-full w-full flex-row items-center justify-center px-4">
          <ul role="list" className="flex w-full flex-row justify-around ">
            {navMenu
              .filter((item) => item.showOnMobile)
              .sort((itemX, itemY) =>
                itemX.mobileOrder - itemY.mobileOrder > 0 ? 1 : -1,
              )
              .map((navItem, index) => (
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
              ))}
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
      <div className="mb-4 mt-4 flex  gap-5 text-white">
        <Link
          href="/dashboard/transaction/send"
          className="flex flex-1  justify-center rounded-md bg-blue-600 p-3"
        >
          <span className=" text-sm">Send</span>
        </Link>
        <Link
          href="/dashboard/transaction/receive"
          className="flex flex-1  justify-center rounded-md bg-blue-600 p-3"
        >
          <span className=" text-sm">Receive</span>
        </Link>
      </div>
    </>
  );
}
