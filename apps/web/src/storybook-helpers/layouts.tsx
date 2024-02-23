import DashboardLayout from "@/app/dashboard/layout";
import TransactionLayout from "@/app/dashboard/transaction/layout";
import { ReactNode } from "react";

export function dashboardLayoutDecorator(Story: () => ReactNode) {
  return (
    <DashboardLayout>
      <Story />
    </DashboardLayout>
  );
}

export function transactionLayoutDecorator(Story: () => ReactNode) {
  return (
    <TransactionLayout>
      <Story />
    </TransactionLayout>
  );
}
