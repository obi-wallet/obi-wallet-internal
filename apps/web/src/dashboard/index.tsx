"use client";

import { Account, Button, Divider, Text } from "@/components";
import { useStore } from "@/contexts";
import { PrettyCaip19Asset, useBalances } from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { allTargetChainIds, TargetChain, TargetChainId } from "@/target-chain";
import { SecretChainId } from "@/target-chain/secret/chains";
import { Input } from "@/ui/input";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import { parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { CiSearch } from "react-icons/ci";
import invariant from "tiny-invariant";

import { PendingAssets } from "./pending";

export const DashboardPage = observer(function Dashboard() {
  useCurrentWallet({ redirectTo: "/" });

  return (
    <div className="flex w-full flex-col text-white">
      <Assets />
    </div>
  );
});

const Assets = observer(function Assets() {
  const [searchAsset, setSearchAsset] = useState("");
  const [editMode, setEditMode] = useState(false);

  return (
    <>
      <div className="hidden w-full flex-1 flex-col max-md:flex">
        <Account />
        <Button
          href="/dashboard/tokens/add"
          className="mb-2 flex-1 justify-center rounded-lg border-dashed border-blue-500 bg-transparent p-2 text-sm font-normal"
        >
          Import New Asset
        </Button>
        <Button
          onClick={() => {
            setEditMode((value) => {
              return !value;
            });
          }}
          className="mb-2 flex-1 justify-center rounded-lg border-dashed border-blue-500 bg-transparent p-2 text-sm font-normal"
        >
          Edit
        </Button>
      </div>
      <div className="hidden flex-row items-center gap-3 md:flex">
        <Input
          className="mt-0 px-3 py-1.5"
          leftComponent={<CiSearch className="h-6 w-6" color="white" />}
          labelClassname="bg-background-secondary"
          placeholder="Search Assets"
          value={searchAsset}
          onChange={(asset) => {
            setSearchAsset(asset);
          }}
          inputClassName="ml-2"
        />
        <Button
          href="/dashboard/tokens/add"
          className="h-9 w-64 justify-center rounded-lg border-dashed border-blue-500 bg-transparent text-sm font-normal"
        >
          Import New Asset
        </Button>
        <Button
          onClick={() => {
            setEditMode((value) => {
              return !value;
            });
          }}
          className="h-9 justify-center rounded-lg border-dashed border-blue-500 bg-transparent text-sm font-normal"
        >
          Edit
        </Button>
      </div>

      <Divider className="mt-5 hidden md:block" />

      {editMode ? (
        <EditMode searchAsset={searchAsset.toLowerCase()} />
      ) : (
        <>
          <PendingAssets />
          <AssetBalance searchAsset={searchAsset.toLowerCase()} />
          <div className="mt-10 flex w-full flex-row items-center justify-center max-md:px-2">
            <Text size="sm" className="leading-normal" fontWeight="light">
              Fast Travel transactions may take a few minutes to be processed
              and will appear here once visible on the network.
            </Text>
          </div>
        </>
      )}
    </>
  );
});

const EditMode = observer(function EditMode({
  searchAsset,
}: {
  searchAsset: string;
}) {
  const wallet = useCurrentWallet({});
  const { targetChainsStore } = useStore();
  const prettyBalances = usePrettyBalances(searchAsset);

  if (!wallet) return null;

  const hydratedChains = allTargetChainIds.map((id) => {
    return {
      chain: TargetChain.chainId(id),
      config: targetChainsStore.getTargetChainConfig({
        address: wallet.userEntryAddress,
        chainId: id,
      }),
    };
  });
  type HydratedChain = (typeof hydratedChains)[0];

  const renderChains = ({ chains }: { chains: HydratedChain[] }) => {
    const ids = chains.map((chain) => {
      return chain.chain.chainId;
    });

    const subPrettyBalances = prettyBalances.data.filter((balance) => {
      return ids.includes(balance.chain.chainId);
    });

    const notFoundIds = ids.filter((id) => {
      return !subPrettyBalances.find((balance) => {
        return balance.chain.chainId === id;
      });
    });

    notFoundIds.forEach((id) => {
      subPrettyBalances.push({
        prettyData: [],
        chain: TargetChain.chainId(id),
      });
    });

    return subPrettyBalances.map((balance) => {
      return (
        <Network
          key={balance.chain.chainId}
          assets={{
            prettyData: balance.prettyData,
            chain: balance.chain,
          }}
          editMode
        />
      );
    });
  };

  const enabledChains = hydratedChains.filter((chain) => {
    return chain.config.enabled === true;
  });

  const autoEnabledChains = hydratedChains.filter((chain) => {
    return chain.config.enabled === undefined && !chain.chain.disabled;
  });

  const autoDisabledChains = hydratedChains.filter((chain) => {
    return chain.config.enabled === undefined && chain.chain.disabled;
  });

  const disabledChains = hydratedChains.filter((chain) => {
    return chain.config.enabled === false;
  });

  return (
    <>
      {renderChains({ chains: enabledChains })}
      {renderChains({ chains: autoEnabledChains })}
      {renderChains({ chains: autoDisabledChains })}
      {renderChains({ chains: disabledChains })}
    </>
  );
});

const AssetBalance = observer(function AssetBalance({
  searchAsset,
}: {
  searchAsset: string;
}) {
  const prettyBalances = usePrettyBalances(searchAsset);

  if (prettyBalances.status === PrettyBalancesStatus.Loading) {
    return <span className="font-extrabold text-white">Loading</span>;
  }

  if (prettyBalances.status === PrettyBalancesStatus.NoAssets) {
    return <span className="font-extrabold text-white">No Assets</span>;
  }

  return (
    <nav className="h-full overflow-y-auto">
      {prettyBalances.data.map((chainBalance) => {
        return (
          <Network key={chainBalance.chain.chainId} assets={chainBalance} />
        );
      })}
    </nav>
  );
});

export const AssetsContainer = observer(function AssetsContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ul role="list">
      <li className="relative flex py-1.5">
        <div className="flex w-3/4 justify-between gap-x-4 pl-4 pr-6 sm:flex-none">
          <Text
            fontWeight="light"
            className="text-[10px] uppercase text-slate-400"
          >
            Asset
          </Text>

          <Text
            fontWeight="light"
            className="text-[10px] uppercase text-slate-400 max-sm:hidden"
          >
            Balance
          </Text>
        </div>

        <div className="flex w-1/4 items-center justify-end gap-x-4 sm:flex-none">
          <Text
            fontWeight="light"
            className="pr-4 text-[10px] uppercase text-slate-400 sm:hidden"
          >
            Balance
          </Text>
          <Text
            fontWeight="light"
            className="text-[10px] uppercase text-slate-400 max-sm:hidden"
          >
            Value
          </Text>
        </div>
      </li>
      {children}
    </ul>
  );
});

const Network = observer(function NetworkAssets({
  assets,
  editMode,
}: {
  assets: PrettyBalancesData;
  editMode?: boolean;
}) {
  const wallet = useCurrentWallet({});
  const { targetChainsStore } = useStore();

  if (!wallet) return null;

  const targetChainConfig = targetChainsStore.getTargetChainConfig({
    address: wallet.userEntryAddress,
    chainId: assets.chain.chainId,
  });

  return (
    <div className="relative py-1.5">
      <div className="sticky top-0 z-10">
        <h3
          className="rounded-t-lg px-4 py-1.5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)",
          }}
        >
          <div className="flex flex-row items-center gap-2">
            <img
              src={assets.chain.image}
              alt={assets.chain.label}
              className="h-5 w-5 sm:h-8 sm:w-8"
            />
            <Text className="text-xs text-white opacity-70">
              {assets.chain.label}
            </Text>
            {editMode ? (
              <div className="flex flex-grow justify-end">
                <Button
                  variant={
                    targetChainConfig.enabled === true ? "primary" : "outline"
                  }
                  className="h-5"
                  onClick={() => {
                    targetChainsStore.setTargetChainConfig({
                      address: wallet.userEntryAddress,
                      chainId: assets.chain.chainId,
                      config: { enabled: true },
                    });
                  }}
                >
                  Enable
                </Button>
                <Button
                  variant={
                    targetChainConfig.enabled === false ? "primary" : "outline"
                  }
                  className="h-5"
                  onClick={() => {
                    targetChainsStore.setTargetChainConfig({
                      address: wallet.userEntryAddress,
                      chainId: assets.chain.chainId,
                      config: { enabled: false },
                    });
                  }}
                >
                  Disable
                </Button>
                <Button
                  variant={
                    targetChainConfig.enabled === undefined
                      ? "primary"
                      : "outline"
                  }
                  className="h-5"
                  onClick={() => {
                    targetChainsStore.setTargetChainConfig({
                      address: wallet.userEntryAddress,
                      chainId: assets.chain.chainId,
                      config: {},
                    });
                  }}
                >
                  Auto ({assets.chain.disabled ? "disabled" : "enabled"})
                </Button>
              </div>
            ) : null}
          </div>
        </h3>
      </div>
      <AssetsContainer>
        {assets.prettyData.map((data) => {
          return (
            <AssetRow key={data.assetId} asset={data} editMode={editMode} />
          );
        })}
      </AssetsContainer>
    </div>
  );
});

export const AssetRow = observer(function AssetRow({
  asset,
  editMode,
}: {
  asset: PrettyCaip19Asset;
  editMode?: boolean;
}) {
  const router = useRouter();
  const wallet = useCurrentWallet({});
  const { viewingKeysStore } = useStore();

  const viewingKey = viewingKeysStore.getViewingKey({
    address: wallet?.userEntryAddress ?? "",
    assetId: asset.assetId,
  });
  const assetInfo = parseCaip19AssetId(asset.assetId);
  const isPrivateToken =
    assetInfo.chainId === SecretChainId.Secret &&
    assetInfo.namespace === "snip20";

  return (
    <li
      className="hover:bg-asset-hover-gradient relative flex cursor-pointer justify-between py-1.5 hover:rounded-lg"
      onClick={() => {
        router.push(
          editMode
            ? `/dashboard/tokens/edit/${encodeURIComponent(asset.assetId)}`
            : `/dashboard/transaction/send/${encodeURIComponent(asset.assetId)}`,
        );
      }}
    >
      <div className="flex justify-between gap-x-4 pl-4 pr-6 sm:w-3/4 sm:flex-none">
        <div className="flex flex-row gap-x-4">
          {asset.assetInfo?.image ? (
            <img
              src={asset.assetInfo.image}
              alt={asset.assetInfo.symbol}
              className="h-6 w-6 sm:h-8 sm:w-8"
            />
          ) : (
            <div className="h-6 w-6 sm:h-8 sm:w-8" />
          )}
          <Text fontWeight="bold" className="max-sm:text-sm">
            {asset.assetInfo?.symbol}
          </Text>
        </div>
        {isPrivateToken ? (
          viewingKey ? (
            editMode ? (
              <Button
                variant="primary"
                className="-ml-6 h-5 max-sm:hidden max-sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (wallet) {
                    viewingKeysStore.removeViewingKey({
                      address: wallet.userEntryAddress,
                      assetId: asset.assetId,
                    });
                  }
                }}
              >
                Remove Viewing Key
              </Button>
            ) : (
              <Text className="-ml-6 text-right tabular-nums max-sm:hidden max-sm:text-sm">
                {asset.prettyAmount.toString()}
              </Text>
            )
          ) : (
            <>
              <Button
                variant="primary"
                className="-ml-6 h-5 max-sm:hidden max-sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/dashboard/tokens/edit/${encodeURIComponent(asset.assetId)}`,
                  );
                }}
              >
                Create Viewing Key
              </Button>
            </>
          )
        ) : (
          <Text className="-ml-6 text-right tabular-nums max-sm:hidden max-sm:text-sm">
            {asset.prettyAmount.toString()}
          </Text>
        )}
      </div>
      <div className="flex items-center justify-end gap-x-4 sm:flex sm:w-1/4 sm:flex-none">
        {isPrivateToken ? (
          viewingKey ? (
            editMode ? (
              <Button
                variant="primary"
                className="-ml-6 h-5 max-sm:text-sm sm:hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  if (wallet) {
                    viewingKeysStore.removeViewingKey({
                      address: wallet.userEntryAddress,
                      assetId: asset.assetId,
                    });
                  }
                }}
              >
                Remove Viewing Key
              </Button>
            ) : (
              <Text className="-ml-6 h-5 max-sm:text-sm sm:hidden">
                {asset.prettyAmount.toString()}
              </Text>
            )
          ) : (
            <>
              <Button
                variant="primary"
                className="-ml-6 h-5 max-sm:text-sm sm:hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/dashboard/tokens/edit/${encodeURIComponent(asset.assetId)}`,
                  );
                }}
              >
                Create Viewing Key
              </Button>
            </>
          )
        ) : (
          <Text className="-ml-6 pr-4 text-right tabular-nums max-sm:text-sm sm:hidden">
            {asset.prettyAmount.toString()}
          </Text>
        )}
        <Text
          fontWeight="bold"
          className="tabular-nums max-sm:hidden max-sm:text-sm"
        >
          ${new BigNumber(asset.usdBalance).toFixed(2)}
        </Text>
      </div>
    </li>
  );
});

enum PrettyBalancesStatus {
  Loading,
  NoAssets,
  SomeAssets,
}

interface PrettyBalancesData {
  prettyData: PrettyCaip19Asset[];
  chain: AbstractTargetChain<TargetChainId>;
}

interface PrettyBalancesResult {
  status: PrettyBalancesStatus;
  data: PrettyBalancesData[];
}

function usePrettyBalances(searchAsset: string): PrettyBalancesResult {
  const balances = useBalances();

  if (
    balances.every((b) => {
      return b.isLoading;
    })
  ) {
    return { status: PrettyBalancesStatus.Loading, data: [] };
  }

  if (
    balances.every((b) => {
      return b.data && b.data.length === 0;
    })
  ) {
    return { status: PrettyBalancesStatus.NoAssets, data: [] };
  }

  const data = balances
    .map((balance) => {
      return balance.data ?? [];
    })
    .filter((balance) => {
      return balance.length > 0;
    })
    .map((balance) => {
      const [firstAsset] = balance;
      invariant(firstAsset, "Expected first asset to be set.");
      const { chainId } = parseCaip19AssetId(firstAsset.assetId);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const chain = TargetChain.chainId(chainId as TargetChainId);
      const prettyData = balance
        .filter((asset) => {
          return (asset.assetInfo?.symbol.toLowerCase() ?? "").includes(
            searchAsset,
          );
        })
        .sort((assetA, assetB) => {
          if (assetA.usdBalance < assetB.usdBalance) return 1;
          return -1;
        });

      return {
        prettyData,
        usdValue: prettyData.reduce((acc, curr) => {
          return acc.plus(curr.usdBalance);
        }, new BigNumber(0)),
        chain,
      };
    })
    .sort((balanceA, balanceB) => {
      if (balanceA.usdValue.lt(balanceB.usdValue)) return 1;
      return -1;
    });

  return {
    status: PrettyBalancesStatus.SomeAssets,
    data,
  };
}
