"use client";

import { Footer } from "@/components";

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex w-full flex-col items-center justify-center max-sm:px-10">
      <div className="mt-24 w-fit grow max-sm:w-full">{children}</div>
      <Footer />
    </section>
  );
}
