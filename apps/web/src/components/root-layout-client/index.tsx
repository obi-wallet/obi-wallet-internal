"use client";
import { Alert } from "@/alert";
import { Header } from "@/components";
import { MainContainer, RootContainer } from "@/layouts/root";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { ReactNode, useRef } from "react";

import { MaintenancePage } from "../maintenance";

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
  const bypassRef = useRef<boolean | null>(null);
  const searchParams = useSearchParams();

  if (bypassRef.current === null) {
    bypassRef.current = searchParams.get("bypass") === "true";
  }

  if (isMaintenance && !bypassRef.current) {
    return <MaintenancePage />;
  }

  return (
    <RootContainer>
      <Provider>
        <Header />
        <MainContainer>{children}</MainContainer>
        <div id="modal-root" />
        <Alert />
      </Provider>
    </RootContainer>
  );
}
