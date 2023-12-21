import { Footer } from "@/components";
import { ReactNode } from "react";

export default function OnboardLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex w-full flex-col items-center justify-center">
      <div className="mt-24 w-fit grow ">{children}</div>
      <Footer />
    </section>
  );
}
