import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Obi - Buy Crypto",
  description: "Anything in two clicks",
};

const layout = function ({ children }: { children: ReactNode }) {
  return <>{children}</>;
};

export default layout;
