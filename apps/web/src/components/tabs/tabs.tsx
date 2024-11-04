"use client";

import { UnstyledLink } from "@/components";
import { ReactNode } from "react";

function TabUiLinks({ children }: { children: ReactNode }) {
  return <div className="flex gap-4 border-gray-300">{children}</div>;
}

function TabUiLink({
  active,
  href,
  children,
}: {
  active?: boolean;
  href: string;
  children: ReactNode;
}) {
  return (
    <UnstyledLink
      className={`${
        active ? "bg-background-primary rounded-xl" : ""
      } flex min-w-max px-8 py-2 text-center text-base font-normal text-white`}
      href={href}
    >
      {children}
    </UnstyledLink>
  );
}

function TabUiMain({ children }: { children: ReactNode }) {
  return <div className="py-4">{children}</div>;
}

export const TabUi = {
  Links: TabUiLinks,
  Link: TabUiLink,
  Main: TabUiMain,
};

export interface TabProps {
  label?: string;
  children: ReactNode;
}

export function Tab({ children }: TabProps) {
  return <div className="hidden">{children}</div>;
}
