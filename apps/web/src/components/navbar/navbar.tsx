"use client";

import { observer } from "mobx-react-lite";
import { usePathname } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { FaGear, FaCreditCard } from "react-icons/fa6";

import { Account } from "../account/account";
import { Footer } from "../footer/footer";
import { PrimaryLink } from "../links";
import { Text } from "../text/text";

const navMenu = [
  {
    href: "/home",
    text: "Home",
    module: "dashboard",
    icon: <FaHome className="h-8 w-8 text-white" />,
  },
  {
    href: "/settings",
    text: "Settings",
    module: "settings",
    icon: <FaGear className="h-8 w-8 text-white" />,
  },
  {
    href: "/buy-crypto",
    text: "Buy Crypto",
    module: "buy-crypto",
    icon: <FaCreditCard className="h-8 w-8 text-white" />,
  },
];

export const Navbar = observer(function Navbar() {
  const pathname = usePathname();
  const mainURISegment = pathname.split("/")[1];
  return (
    <nav className="flex flex-col bg-slate-900 px-7 pt-16">
      <Account />
      <div className="grow">
        <ul role="list" className="mt-9 flex flex-col space-y-7">
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
});
