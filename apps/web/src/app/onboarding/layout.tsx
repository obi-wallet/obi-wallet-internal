"use client";

import { Footer } from "@/components";
import { cn } from "@/lib/utils";

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex w-full flex-col items-center justify-center max-sm:px-3">
      <div
        className={cn(
          "mt-24 w-fit grow",
          "max-md:mt-5 max-md:flex max-md:flex-col max-md:justify-center max-sm:w-full",
        )}
      >
        {children}
      </div>
      <Footer />
    </section>
  );
}
