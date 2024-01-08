"use client";

import { usePathname, useRouter } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { FaGear, FaCreditCard } from "react-icons/fa6";
import { MdCardTravel } from "react-icons/md";

import { Button, Divider, Account, Footer, PrimaryLink, Text } from "..";

const navMenu = [
  {
    href: "/dashboard/dashboard",
    text: "Home",
    module: "dashboard",
    icon: <FaHome className="h-8 w-8 text-white" />,
  },
  {
    href: "/dashboard/settings",
    text: "Settings",
    module: "settings",
    icon: <FaGear className="h-8 w-8 text-white" />,
  },
  {
    href: "/dashboard/buy-crypto",
    text: "Buy Crypto",
    module: "buy-crypto",
    icon: <FaCreditCard className="h-8 w-8 text-white" />,
  },
  {
    href: "/dashboard/fast-travel",
    text: "Fast Travel",
    module: "fast-travel",
    icon: <MdCardTravel className="h-8 w-8 text-white" />,
  },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const mainURISegment = pathname.split("/")[2];

  return (
    <nav className="flex flex-col bg-slate-900 px-7 pt-16">
      <Account />
      <Button
        className="my-7 text-3xl font-bold"
        block
        onClick={() => router.push("/dashboard/transaction")}
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
                  mainURISegment?.indexOf(navItem.module) === 0
                    ? "rounded-md bg-gray-700 font-bold"
                    : ""
                }`}
              >
                {navItem.icon}
                <Text
                  className="ml-7"
                  fontWeight={
                    mainURISegment?.indexOf(navItem.module) === 0
                      ? "bold"
                      : "normal"
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
