"use client";
import React, { ReactNode, useState } from "react";
interface TabProps {
  label?: string;
  children: ReactNode;
}

const Tabs: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>(
    (children as any)[0].props.label,
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
        {React.Children.map(children, (child) => (
          <button
            key={(child as any).props.label}
            className={`${
              activeTab === (child as any).props.label
                ? "rounded-xl bg-slate-950"
                : ""
            } flex-1 py-2 text-base font-normal
            text-white`}
            onClick={(e) => handleClick(e, (child as any).props.label)}
          >
            {(child as any).props.label}
          </button>
        ))}
      </div>
      <div className="py-4">
        {React.Children.map(children, (child) => {
          if ((child as any).props.label === activeTab) {
            return (
              <div key={(child as any).props.label}>
                {(child as any).props.children}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

const Tab: React.FC<TabProps> = ({ label, children }) => {
  return <div className="hidden">{children}</div>;
};

export { Tabs, Tab };
