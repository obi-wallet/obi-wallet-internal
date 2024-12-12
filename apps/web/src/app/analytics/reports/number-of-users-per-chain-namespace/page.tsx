"use client";

import { useQuery } from "@obi-wallet/headless-ui";
import { useSearchParams } from "next/navigation";

export default function NumberOfUsersPerChainNamespace() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const query = useQuery({
    queryKey: ["number-of-users-per-chain-namespace", from, to],
    queryFn: async () => {
      const url = new URL(
        "/api/analytics/reports/number-of-users-per-chain-namespace",
        window.location.origin,
      );
      if (from) {
        url.searchParams.set("from", from);
      }
      if (to) {
        url.searchParams.set("to", to);
      }
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      return await response.json();
    },
  });

  const data: { namespace: string; users: number }[] = query.data ?? [];

  if (!Array.isArray(data)) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                  >
                    Chain Namespace
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                  >
                    # of Users
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((row) => {
                  return (
                    <tr key={row.namespace}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        {row.namespace}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                        {row.users}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
