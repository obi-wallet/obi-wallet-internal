"use client";
import { Box, TabUi } from "@/components";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function TransactionLayout({
  children,
}: {
  children: ReactNode;
}) {
  // we need to know which tab is active using the pathname
  const pathName = usePathname();

  const activeTab = pathName.split("/").pop();

  return (
    <div className="w-full ">
      <Box className="m-5 w-full sm:w-2/3">
        <TabUi.Links>
          <TabUi.Link
            href="/dashboard/transaction/send"
            active={activeTab === "send"}
          >
            Send Tokens
          </TabUi.Link>
          <TabUi.Link
            href="/dashboard/transaction/receive"
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
