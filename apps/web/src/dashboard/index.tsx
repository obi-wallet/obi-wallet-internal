"use client";

import { Account, Button, Divider, Text } from "@/components";
import { useStore } from "@/contexts";
import { PrettyCaip19Asset, useBalances } from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { allTargetChainIds, TargetChain, TargetChainId } from "@/target-chain";
import { Input } from "@/ui/input";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import { parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
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

  const chainIds = allTargetChainIds;

  const hydratedChains = chainIds.map((id) => {
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
        <NetworkAssets
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
    <div className="flex flex-col gap-10">
      {renderChains({ chains: enabledChains })}
      {renderChains({ chains: autoEnabledChains })}
      {renderChains({ chains: autoDisabledChains })}
      {renderChains({ chains: disabledChains })}
    </div>
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
    <div className="flex flex-col gap-10">
      {prettyBalances.data.map((chainBalance) => {
        return (
          <NetworkAssets
            key={chainBalance.chain.chainId}
            assets={chainBalance}
          />
        );
      })}
    </div>
  );
});

const NetworkAssets = observer(function NetworkAssets({
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
    <div>
      <div
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
      </div>
      <div className="flex gap-5 py-1.5 pl-4 sm:flex">
        <div className="flex w-full justify-between ">
          <Text fontWeight="light" className="text-[10px] text-slate-400">
            ASSET
          </Text>

          <Text fontWeight="light" className="text-[10px] text-slate-400">
            BALANCE
          </Text>

          <Text fontWeight="light" className="text-[10px] text-slate-400">
            VALUE
          </Text>
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        {assets.prettyData.map((data) => {
          return (
            <Fragment key={data.assetId}>
              <AssetItem asset={data} editMode={editMode} />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
});

function AssetItem({
  asset,
  editMode,
}: {
  asset: PrettyCaip19Asset;
  editMode?: boolean;
}) {
  const router = useRouter();

  return (
    <div
      className="hover:bg-asset-hover-gradient flex w-full cursor-pointer justify-between gap-5  py-1.5  pl-4  hover:rounded-lg"
      onClick={() => {
        router.push(
          editMode
            ? `/dashboard/tokens/edit/${encodeURIComponent(asset.assetId)}`
            : `/dashboard/transaction/send/${encodeURIComponent(asset.assetId)}`,
        );
      }}
    >
      <div className="flex flex-row gap-2 ">
        {asset.assetInfo?.image ? (
          <img
            src={asset.assetInfo.image}
            alt={asset.assetInfo.symbol}
            className="h-6 w-6 sm:h-8 sm:w-8"
          />
        ) : (
          <div className="h-6 w-6 sm:h-8 sm:w-8" />
        )}

        <Text fontWeight="bold" className="max-sm:text-sm ">
          {asset.assetInfo?.symbol}
        </Text>
      </div>

      <Text className=" -ml-6 max-sm:text-sm ">
        {asset.prettyAmount.toString()}
      </Text>
      <Button variant="primary" className="h-5">
        View Balance
      </Button>
      <Text fontWeight="bold" className=" max-sm:text-sm">
        ${new BigNumber(asset.usdBalance).toFixed(2)}
      </Text>
    </div>
  );
}

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
