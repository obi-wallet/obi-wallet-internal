import { Header, PasskeyNotification } from "@/components";
import { TOSModal } from "@/components/modals/tos";
import { MainContainer, RootContainer } from "@/layouts/root";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

import "./globals.css";

const Provider = dynamic(() => import("@/components/provider"), {
  ssr: false,
});
export const metadata: Metadata = {
  title: "Obi - Anything In Two Clicks",
  description: "Anything In Two Clicks",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <RootContainer>
          <Provider>
            <Header />
            <MainContainer>{children}</MainContainer>
            <div id="modal-root" />
          </Provider>
        </RootContainer>
      </body>
    </html>
  );
}
