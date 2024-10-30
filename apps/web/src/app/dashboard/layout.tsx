import {
  Ed25519KeyPairNotification,
  Navbar,
  NoRecoveryKeysNotification,
  WalletDataNotification,
} from "@/components";
import { DashboardCustomLayout } from "@/layouts/dashboard";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Obi - Dashboard",
  description: "Anything in two clicks",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardCustomLayout nav={<Navbar />}>
      <WalletDataNotification />
      <NoRecoveryKeysNotification />
      <Ed25519KeyPairNotification />
      {children}
    </DashboardCustomLayout>
  );
}
