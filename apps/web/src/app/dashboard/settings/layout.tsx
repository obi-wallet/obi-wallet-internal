import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Obi - Settings",
  description: "Anything in two clicks",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
