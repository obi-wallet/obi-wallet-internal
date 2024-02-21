import { Navbar } from "@/components";
import { UserInteractionsHandlers } from "@/user-interactions";
import type { Metadata } from "next";
import { ReactNode } from "react";
export const metadata: Metadata = {
  title: "Obi - Dashboard",
  description: "Anything in two clicks",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <section className="relative flex w-full ">
      <Navbar />
      {/* 96px for bottom-navbar and 80px for header */}
      <div className="flex grow overflow-auto py-5 max-sm:h-[calc(100vh-96px-80px)] max-sm:px-4 max-sm:py-0 sm:px-7">
        <UserInteractionsHandlers>{children}</UserInteractionsHandlers>
      </div>
    </section>
  );
}
