"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Account, Divider, Footer, PrimaryLink, Text } from "..";

type NavMenu = {
  href: string;
  text: string;
  module: string;
  icon: string;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  target?: string;
};
const navMenu: NavMenu[] = [
  {
    href: "/dashboard/transaction/send",
    text: "Transact",
    module: "",
    icon: "/assets/icons/nav-transact.svg",
    showOnMobile: true,
    showOnDesktop: false,
  },
  {
    href: "/dashboard",
    text: "Home",
    module: "",
    icon: "/assets/icons/nav-home.svg",
    showOnMobile: true,
    showOnDesktop: true,
  },

  {
    href: "/dashboard/buy-crypto",
    text: "Buy Crypto",
    module: "buy-crypto",
    icon: "/assets/icons/nav-buy-crypto.svg",
    showOnDesktop: true,
    showOnMobile: true,
  },
  {
    href: "/dashboard/fast-travel",
    text: "Fast Travel",
    module: "fast-travel",
    icon: "/assets/icons/nav-fast-travel.svg",
    showOnDesktop: true,
    showOnMobile: true,
  },
  {
    href: "/dashboard/app-connect",
    text: "App Connect",
    module: "app-connect",
    icon: "/assets/icons/nav-app-connect.svg",
    showOnDesktop: true,
    showOnMobile: true,
  },
  {
    href: "/dashboard/settings",
    text: "Settings",
    module: "settings",
    icon: "/assets/icons/nav-settings.svg",
    showOnMobile: true,
    showOnDesktop: true,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const mainURISegment = pathname.split("/")[2] || "";

  return (
    <nav className="bg-background-secondary relative max-sm:absolute max-sm:bottom-0 max-sm:h-24 max-sm:w-full sm:h-full">
      <div className="flex h-full w-[330px] flex-col px-7 pt-16 max-sm:hidden">
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
        <Divider />

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
      <div className="flex h-full w-full sm:hidden">
        <ul
          role="list"
          className="flex h-full w-full flex-row  items-center justify-around "
        >
          {navMenu
            .filter((item) => item.showOnMobile)
            .map((navItem, index) => (
              <li key={`navmenu-${index}`}>
                <PrimaryLink
                  href={navItem.href}
                  className="flex flex-col items-center justify-center space-y-3"
                >
                  <Image
                    src={navItem.icon}
                    height={32}
                    width={32}
                    alt={navItem.text}
                    className="!h-8 !w-8"
                  />
                  <Text>{navItem.text}</Text>
                </PrimaryLink>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  );
}
