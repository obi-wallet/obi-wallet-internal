"use client";
import { Box, TabUi } from "@/components";
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
      <Box className="w-full lg:w-1/2">
        <TabUi.Links>
          <TabUi.Link
            href={`/dashboard/transaction/send/${rest.join("/")}`}
            active={activeTab === "send"}
          >
            Send Tokens
          </TabUi.Link>
          <TabUi.Link
            href={`/dashboard/transaction/receive/${rest.join("/")}`}
            active={activeTab === "receive"}
          >
            Receive Tokens
          </TabUi.Link>
        </TabUi.Links>
        {children}
      </Box>
    </div>
  );
}
