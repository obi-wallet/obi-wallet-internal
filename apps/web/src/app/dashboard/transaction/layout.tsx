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
      <Box className="w-full">
        <div className="mb-4 flex gap-2.5">
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
          ? "flex h-11 w-full items-center justify-center rounded-[5px] bg-[#32c9af] p-2.5"
          : "flex h-11 w-full items-center justify-center rounded-[5px] bg-[#353535] p-2.5"
      }
    >
      <span
        className={
          active
            ? "font-['Roboto Mono'] text-lg font-normal text-[#070707]"
            : "font-['Roboto Mono'] text-lg font-normal text-white"
        }
      >
        {children}
      </span>
    </a>
  );
}
