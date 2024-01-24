"use client";

import { UnstyledLink } from "@/components";
import { Children, ReactElement, ReactNode, useState } from "react";

function TabUiLinks({ children }: { children: ReactNode }) {
  return <div className="flex border-gray-300">{children}</div>;
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
        active ? "rounded-xl bg-slate-950" : ""
      } flex-1 py-2 text-center text-base
            font-normal text-white`}
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

export function Tabs({ children }: { children: ReactElement<TabProps>[] }) {
  const [activeTab, setActiveTab] = useState<string>(
    (Children.toArray(children)[0] as ReactElement<TabProps>).props.label || "",
  );

  return (
    <>
      <TabUi.Links>
        {Children.map(children, (tab) => {
          return (
            <button
              key={tab.props.label}
              className={`${
                activeTab === tab.props.label ? "rounded-xl bg-slate-950" : ""
              } flex-1 py-2 text-base font-normal
            text-white`}
              onClick={() => {
                setActiveTab(tab.props.label || "");
              }}
            >
              {tab.props.label}
            </button>
          );
        })}
      </TabUi.Links>
      <TabUi.Main>
        {Children.map(children, (child) => {
          const tab = child as ReactElement<TabProps>;
          if (tab.props.label === activeTab) {
            return <div key={tab.props.label}>{tab.props.children}</div>;
          }
          return null;
        })}
      </TabUi.Main>
    </>
  );
}

export function Tab({ children }: TabProps) {
  return <div className="hidden">{children}</div>;
}
