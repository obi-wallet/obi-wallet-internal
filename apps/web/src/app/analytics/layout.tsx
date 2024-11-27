"use client";

import { ReportsSecretsContext } from "@/analytics/reports-secrets-context";
import { Button } from "@/components";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode, useRef, useState } from "react";
import invariant from "tiny-invariant";

function AnalyticsLayout({ children }: { children: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const [secret, setSecret] = useState("");
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  return <>{getChildren()}</>;

  function getUrl(path: string) {
    const url = new URL(`/analytics/reports/${path}`, window.location.origin);
    if (from) {
      url.searchParams.set("from", from);
    }
    if (to) {
      url.searchParams.set("to", to);
    }
    return {
      href: url.toString(),
      current: pathname.includes(`/${path}?`) || pathname.endsWith(`/${path}`),
    };
  }

  function getChildren() {
    if (secret) {
      const tabs = [
        {
          name: "# of Onboardings per DApp",
          ...getUrl("number-of-onboardings-per-dapp"),
        },
        {
          name: "# of Users per Asset",
          ...getUrl("number-of-users-per-asset"),
        },
        {
          name: "# of Users per Chain",
          ...getUrl("number-of-users-per-chain"),
        },
        {
          name: "# of Users per Chain Namespace",
          ...getUrl("number-of-users-per-chain-namespace"),
        },
        {
          name: "# of Users per DApp",
          ...getUrl("number-of-users-per-dapp"),
        },
      ];

      return (
        <ReportsSecretsContext.Provider value={secret}>
          <div>
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                Select a tab
              </label>
              {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
              <select
                id="tabs"
                name="tabs"
                defaultValue={
                  tabs.find((tab) => {
                    return tab.current;
                  })?.name
                }
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                {tabs.map((tab) => {
                  return <option key={tab.name}>{tab.name}</option>;
                })}
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    return (
                      <Link
                        key={tab.name}
                        href={tab.href}
                        aria-current={tab.current ? "page" : undefined}
                        className={cn(
                          tab.current
                            ? "border-blue-500 text-blue-700"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
                        )}
                      >
                        {tab.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {children}
        </ReportsSecretsContext.Provider>
      );
    }

    return (
      <>
        <input type="password" ref={inputRef} />
        <Button
          onClick={() => {
            invariant(inputRef.current, "Input ref is missing");
            setSecret(inputRef.current.value);
          }}
        >
          Log In
        </Button>
      </>
    );
  }
}

export default AnalyticsLayout;
