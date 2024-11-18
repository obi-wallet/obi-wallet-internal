"use client";
import { Box } from "@/components";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function TransactionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathName = usePathname();
  const [_slash, _dashboard, _transaction, activeTab, ...rest] =
    pathName.split("/");

  return (
    <div className="w-full">
      <Box className="w-full xl:w-1/2">
        <div className="flex gap-2.5 mb-4">
          <TabLink
            href={`/dashboard/transaction/send/${rest.join("/")}`}
            active={activeTab === "send"}
          >
            Send
          </TabLink>
          <TabLink
            href={`/dashboard/transaction/receive/${rest.join("/")}`}
            active={activeTab === "receive"}
          >
            Receive
          </TabLink>
        </div>
        {children}
      </Box>
    </div>
  );
}

interface TabLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function TabLink({ href, active, children }: TabLinkProps) {
  return (
    <a
      href={href}
      className={
        active
          ? "w-full h-11 p-2.5 bg-[#32c9af] rounded-[5px] flex items-center justify-center"
          : "w-full h-11 p-2.5 bg-[#353535] rounded-[5px] flex items-center justify-center"
      }
    >
      <span
        className={
          active
            ? "text-[#070707] text-lg font-normal font-['Roboto Mono']"
            : "text-white text-lg font-normal font-['Roboto Mono']"
        }
      >
        {children}
      </span>
    </a>
  );
}
