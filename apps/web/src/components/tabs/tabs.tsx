"use client";
import React, { ReactElement, ReactNode, useState } from "react";
interface TabProps {
  label?: string;
  children: ReactNode;
}

function Tabs({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>(
    (React.Children.toArray(children)[0] as ReactElement<TabProps>).props
      .label || "",
  );

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    newActiveTab: string,
  ) => {
    e.preventDefault();
    setActiveTab(newActiveTab);
  };

  return (
    <div className="">
      <div className="flex border-gray-300">
        {React.Children.map(children, (child) => {
          const tab = child as ReactElement<TabProps>;
          return (
            <button
              key={tab.props.label}
              className={`${
                activeTab === tab.props.label ? "rounded-xl bg-slate-950" : ""
              } flex-1 py-2 text-base font-normal
            text-white`}
              onClick={(e) => handleClick(e, tab.props.label || "")}
            >
              {tab.props.label}
            </button>
          );
        })}
      </div>
      <div className="py-4">
        {React.Children.map(children, (child) => {
          const tab = child as ReactElement<TabProps>;
          if (tab.props.label === activeTab) {
            return <div key={tab.props.label}>{tab.props.children}</div>;
          }
          return null;
        })}
      </div>
    </div>
  );
}

function Tab({ children }: TabProps) {
  return <div className="hidden">{children}</div>;
}

export { Tabs, Tab };
