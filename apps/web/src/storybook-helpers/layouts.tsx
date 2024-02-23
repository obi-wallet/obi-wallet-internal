import { DashboardCustomLayout } from "@/app/dashboard/layout";
import TransactionLayout from "@/app/dashboard/transaction/layout";
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
