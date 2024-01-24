"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { Account, Button, Divider, Footer, PrimaryLink, Text } from "..";

const navMenu = [
  {
    href: "/dashboard",
    text: "Home",
    module: "",
    icon: "/assets/icons/nav-home.svg",
  },
  {
    href: "/dashboard/settings",
    text: "Settings",
    module: "settings",
    icon: "/assets/icons/nav-settings.svg",
  },
  {
    href: "/dashboard/buy-crypto",
    text: "Buy Crypto",
    module: "buy-crypto",
    icon: "/assets/icons/nav-buy-crypto.svg",
  },
  {
    href: "/dashboard/fast-travel",
    text: "Fast Travel",
    module: "fast-travel",
    icon: "/assets/icons/nav-fast-travel.svg",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const mainURISegment = pathname.split("/")[2] || "";

  return (
    <nav className="flex flex-col bg-slate-900 px-7 pt-16">
      <Account />
      <Button
        className="my-7 text-xl font-bold"
        block
        href="/dashboard/transaction/send"
      >
        New Transaction
      </Button>
      <Divider />

      <div className="mt-7 grow">
        <ul role="list" className="flex flex-col space-y-3">
          {navMenu.map((navItem, index) => (
            <li key={`navmenu-${index}`}>
              <PrimaryLink
                href={navItem.href}
                className={`flex flex-row px-6 py-2 text-xl font-normal text-white lg:text-2xl ${
                  mainURISegment === navItem.module
                    ? "rounded-md bg-gray-700 font-bold"
                    : ""
                }`}
              >
                <Image
                  src={navItem.icon}
                  width={40}
                  height={40}
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
    </nav>
  );
}
