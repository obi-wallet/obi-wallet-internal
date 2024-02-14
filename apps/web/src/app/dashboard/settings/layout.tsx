import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Obi - Settings",
  description: "Anything in two clicks",
};

const layout = function ({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
};
export default layout;
