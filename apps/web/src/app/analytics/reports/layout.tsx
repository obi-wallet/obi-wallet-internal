"use client";

import { useSession } from "@/analytics/session/use-session";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const { session, isLoading } = useSession();
  useEffect(() => {
    if (!isLoading && !session.isLoggedIn) {
      router.replace("/analytics/");
    }
  }, [isLoading, session.isLoggedIn, router]);

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
    <div>
      <nav className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            return (
              <Link
                key={tab.name}
                href={tab.href}
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
        </div>
      </nav>
      {children}
    </div>
  );

  function getUrl(path: string) {
    const url = new URL(`/analytics/reports/${path}`, window.location.origin);
    if (from) url.searchParams.set("from", from);
    if (to) url.searchParams.set("to", to);
    return {
      href: url.toString(),
      current: pathname.includes(`/${path}?`) || pathname.endsWith(`/${path}`),
    };
  }
}
