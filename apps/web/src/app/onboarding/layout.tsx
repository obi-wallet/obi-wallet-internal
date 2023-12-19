import * as React from "react";

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="mt-24">{children}</section>;
}
