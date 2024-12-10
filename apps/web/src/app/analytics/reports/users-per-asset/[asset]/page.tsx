"use client";

import { Text } from "@/components";
import { TargetChain } from "@/target-chain";
import { useQuery } from "@obi-wallet/headless-ui";
import { Caip19AssetId, parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import BigNumber from "bignumber.js";
import { useSearchParams } from "next/navigation";
import { use } from "react";

export default function UsersPerAsset(props: {
  params: Promise<{ asset: Caip19AssetId }>;
}) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const asset = decodeURIComponent(use(props.params).asset) as Caip19AssetId;
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const query = useQuery({
    queryKey: ["users-per-asset", asset, from, to],
    queryFn: async () => {
      const url = new URL(
        `/api/analytics/reports/users-per-asset/${encodeURIComponent(asset)}`,
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

      const data: {
        asset: Caip19AssetId;
        userEntryAddress: string;
        amount: number;
        usd_value: number;
      }[] = await response.json();

      const { chainId } = parseCaip19AssetId(asset);
      const targetChain = TargetChain.chainId(chainId);
      return {
        data,
        assetInfo: await targetChain.assetInfo(asset),
      };
    },
  });

  const data = query.data ?? { data: [], assetInfo: null };

  if (!Array.isArray(data.data)) {
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
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.data.map((row) => {
                  return (
                    <tr key={row.userEntryAddress}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        {row.userEntryAddress}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        <div className="flex flex-row gap-x-4">
                          {data.assetInfo?.image ? (
                            <img
                              src={data.assetInfo.image}
                              alt={data.assetInfo.symbol}
                              className="h-6 w-6 sm:h-8 sm:w-8"
                            />
                          ) : (
                            <div className="h-6 w-6 sm:h-8 sm:w-8" />
                          )}
                          <Text fontWeight="bold" className="max-sm:text-sm">
                            {data.assetInfo?.symbol}
                          </Text>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                        {new BigNumber(row.amount)
                          .dividedBy(10 ** (data.assetInfo?.decimals ?? 0))
                          .toString(10)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                        $ {row.usd_value.toFixed(2)}
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
