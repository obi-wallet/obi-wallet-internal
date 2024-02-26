import TransactionLayout from "@/app/dashboard/transaction/layout";
import { DashboardCustomLayout } from "@/layouts/dashboard";
import { ReactNode } from "react";

export function dashboardLayoutDecorator(Story: () => ReactNode) {
  return (
    <DashboardCustomLayout>
      <Story />
    </DashboardCustomLayout>
  );
}

export function transactionLayoutDecorator(Story: () => ReactNode) {
  return (
    <TransactionLayout>
      <Story />
    </TransactionLayout>
  );
}
