import { Metadata } from "next";
import Head from "next/head";
export const metadata: Metadata = {
  title: "Obi - Fast Travel",
  description: "Anything in two clicks",
};

const layout = function ({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
};
export default layout;
