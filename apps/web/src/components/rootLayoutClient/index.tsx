"use client";
import { Header } from "@/components";
import { TOSModal } from "@/components/modals/tos";
import { MainContainer, RootContainer } from "@/layouts/root";
import { ReactNode } from "react";
import dynamic from "next/dynamic";

import { MaintenancePage } from "../maintenance";
import { useSearchParams } from "next/navigation";

const Provider = dynamic(
  () => {
    return import("@/components/provider");
  },
  {
    ssr: false,
  },
);
export function RootLayoutClient({
  children,
  isMaintenance,
}: {
  children: ReactNode;
  isMaintenance: boolean;
}) {
  // get bypass variable from url
  const searchParams = useSearchParams();
  const bypass = searchParams.get("bypass");

  if (isMaintenance && bypass !== "true") {
    return <MaintenancePage />;
  }

  return (
    <RootContainer>
      <Provider>
        <Header />
        <MainContainer>{children}</MainContainer>
        <TOSModal />
        <div id="modal-root" />
      </Provider>
    </RootContainer>
  );
}
