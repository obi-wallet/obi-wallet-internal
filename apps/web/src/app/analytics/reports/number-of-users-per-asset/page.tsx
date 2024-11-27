"use client";

import { Text } from "@/components";
import { TargetChain } from "@/target-chain";
import { useQuery } from "@obi-wallet/headless-ui";
import { Caip19AssetId, parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import { useRouter, useSearchParams } from "next/navigation";

export default function NumberOfUsersPerAsset() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const query = useQuery({
    queryKey: ["number-of-users-per-asset", from, to],
    queryFn: async () => {
      const url = new URL(
        "/api/analytics/reports/number-of-users-per-asset",
        window.location.origin,
      );
      if (from) {
        url.searchParams.set("from", from);
      }
      if (to) {
        url.searchParams.set("to", to);
      }
      const response = await fetch(url.toString());
      const data: { asset: Caip19AssetId; users: number }[] =
        await response.json();
      return await Promise.all(
        data.map(async (row: { asset: Caip19AssetId; users: number }) => {
          const { chainId } = parseCaip19AssetId(row.asset);
          const targetChain = TargetChain.chainId(chainId);

          return {
            ...row,
            chain: targetChain.label ?? chainId,
            assetInfo: await targetChain.assetInfo(row.asset),
          };
        }),
      );
    },
  });

  const data = query.data ?? [];

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
                    Chain
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                  >
                    Asset
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
                    <tr
                      key={row.asset}
                      className="cursor-pointer hover:bg-gray-700"
                      onClick={() => {
                        const url = new URL(
                          `/analytics/reports/users-per-asset/${encodeURIComponent(row.asset)}`,
                          window.location.origin,
                        );
                        if (from) {
                          url.searchParams.set("from", from);
                        }
                        if (to) {
                          url.searchParams.set("to", to);
                        }
                        router.push(url.toString());
                      }}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        {row.chain}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        <div className="flex flex-row gap-x-4">
                          {row.assetInfo?.image ? (
                            <img
                              src={row.assetInfo.image}
                              alt={row.assetInfo.symbol}
                              className="h-6 w-6 sm:h-8 sm:w-8"
                            />
                          ) : (
                            <div className="h-6 w-6 sm:h-8 sm:w-8" />
                          )}
                          <Text fontWeight="bold" className="max-sm:text-sm">
                            {row.assetInfo?.symbol}
                          </Text>
                        </div>
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
