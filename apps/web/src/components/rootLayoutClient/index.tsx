"use client";
import { Header } from "@/components";
import { TOSModal } from "@/components/modals/tos";
import { useAlert } from "@/hooks/alert";
import { MainContainer, RootContainer } from "@/layouts/root";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { ReactNode, useRef } from "react";

import { CustomAlert } from "../custom-alert";
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
        <TOSModal />
        <div id="modal-root" />
        <Alert />
      </Provider>
    </RootContainer>
  );
}

function Alert() {
  const { currentAlert, closeAlert } = useAlert();

  if (!currentAlert) return null;

  return <CustomAlert alert={currentAlert} onClose={closeAlert} />;
}
