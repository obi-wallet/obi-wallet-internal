import { Footer } from "@/components";
import { ReactNode } from "react";

export default function TransactionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}
