"use client";

import { AccountAndCTA, Button, Divider, Text } from "@/components";
import { InlineChainDropdown } from "@/components/dropdown/inline-chain-dropdown";
import { InfoIcon } from "@/components/info-icon";
import { useStore } from "@/contexts/store";
import { PrettyCaip19Asset, useBalances } from "@/hooks/balances";
import { useCreateViewingKey } from "@/hooks/use-create-viewing-key";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { cn } from "@/lib/utils";
import { allTargetChainIds, TargetChain, TargetChainId } from "@/target-chain";
import { Eip155ChainId } from "@/target-chain/eip-155/chains";
import { SecretChainId } from "@/target-chain/secret/chains";
import { AsyncButton } from "@/ui/button";
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
  return (
    <div className="dashboard-page bg-background flex h-[calc(100vh-80px)] w-full flex-col text-white max-md:h-[calc(100vh-64px)] max-md:pb-20">
      <Assets />
    </div>
  );
});

const Assets = observer(function Assets() {
  const [searchAsset, setSearchAsset] = useState("");
  const [editMode, setEditMode] = useState(false);
  const { educationStore } = useStore();

  return (
    <div className="relative z-0 flex h-full flex-col overflow-hidden">
      <AccountAndCTA className={cn("max-lg:mb-2.5 lg:hidden")} />
      <div className="dashboard-controls flex items-center gap-3">
        <div className="dashboard-search min-w-0 flex-[1_1_0] text-sm text-white">
          <Input
            className="dashboard-search-input bg-background-secondary border-primary h-9 w-full rounded px-3 py-1.5"
            leftComponent={
              <CiSearch className="dashboard-search-icon h-6 w-6" />
            }
            labelClassname="bg-background-secondary"
            placeholder="Search"
            value={searchAsset}
            onChange={(asset) => {
              return setSearchAsset(asset);
            }}
            inputClassName="ml-2 bg-transparent placeholder-white"
          />
        </div>

        <div className="dashboard-edit-button min-w-0 flex-[1_1_0] leading-none">
          <Button
            onClick={() => {
              setEditMode((value) => {
                const newValue = !value;
                if (newValue) {
                  educationStore.setTopicById("edit_assets", "router");
                }
                return newValue;
              });
            }}
            variant="accent"
            size="md"
            leading="none"
            className="w-full"
          >
            <div className="flex items-center gap-1">
              {editMode ? "Edit Mode On" : "Edit Mode Off"}
              <InfoIcon topicId="edit_assets" variant="onPrimary" />
            </div>
          </Button>
        </div>

        <div className="dashboard-import-button min-w-0 flex-[1_1_0] leading-none">
          <Button
            href="/dashboard/tokens/add"
            variant="primary-outline"
            size="md"
            leading="none"
            className={`w-full border-dashed ${!editMode ? "invisible" : ""}`}
          >
            <div className="flex items-center justify-center gap-2">
              + Track an Asset
              <InfoIcon
                topicId="import_new_asset"
                className="ml-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </div>
          </Button>
        </div>
      </div>

      <Divider className="dashboard-divider border-primary mt-1 hidden md:block" />

      <div className="scrollbar-hide flex-1 overflow-y-auto max-md:mb-20">
        {editMode ? (
          <EditMode searchAsset={searchAsset.toLowerCase()} />
        ) : (
          <>
            <PendingAssets />
            <AssetBalance searchAsset={searchAsset.toLowerCase()} />
          </>
        )}
      </div>
    </div>
  );
});

const EditMode = observer(function EditMode({
  searchAsset,
}: {
  searchAsset: string;
}) {
  const wallet = useCurrentWallet();
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

  const enabledChains = hydratedChains
    .filter((chain) => {
      return chain.config.enabled === true;
    })
    .sort((a, b) => {
      return a.chain.label.localeCompare(b.chain.label);
    });

  const autoEnabledChains = hydratedChains
    .filter((chain) => {
      return chain.config.enabled === undefined && !chain.chain.disabled;
    })
    .sort((a, b) => {
      return a.chain.label.localeCompare(b.chain.label);
    });

  const autoDisabledChains = hydratedChains
    .filter((chain) => {
      return chain.config.enabled === undefined && chain.chain.disabled;
    })
    .sort((a, b) => {
      return a.chain.label.localeCompare(b.chain.label);
    });

  const disabledChains = hydratedChains
    .filter((chain) => {
      return chain.config.enabled === false;
    })
    .sort((a, b) => {
      return a.chain.label.localeCompare(b.chain.label);
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
    return (
      <div className="flex w-full min-w-0 flex-row items-start p-4">
        <p className="break-words text-left text-sm font-light leading-normal text-white">
          You don't have any assets yet. Receive assets on
          <br />
          <InlineChainDropdown chainId={Eip155ChainId.Ethereum} /> to get
          started!
        </p>
      </div>
    );
  }

  return (
    <nav className="scrollbar-hide h-full w-full max-w-full overflow-y-auto">
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
    <ul className="scrollbar-hide" role="list">
      {/* <li className="relative flex py-1.5">
        <div className="flex w-3/4 justify-between gap-x-4 pl-4 pr-6 sm:flex-none">
          <Text
            fontWeight="light"
            className="text-[10px] uppercase text-slate-400 "
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
      </li> */}
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
  const wallet = useCurrentWallet();
  const { targetChainsStore } = useStore();

  if (!wallet) return null;

  const targetChainConfig = targetChainsStore.getTargetChainConfig({
    address: wallet.userEntryAddress,
    chainId: assets.chain.chainId,
  });

  return (
    <div className="network-container scrollbar-hide relative py-1.5">
      <div className="network-header sticky top-0 z-10">
        <h3 className="network-title bg-primary flex h-9 items-center gap-2.5 rounded px-2.5 py-[5px]">
          <div className="network-title-content flex flex-1 flex-row">
            <Text className="network-chain-name text-background text-base leading-none">
              {assets.chain.label}
            </Text>
            <div className="network-controls flex flex-grow items-center justify-end text-right">
              <Button
                style={
                  targetChainConfig.enabled === true
                    ? {}
                    : { backgroundColor: "#32c9af" }
                }
                className={`network-enable-button bg-accent !h-5 rounded leading-5 text-white ${
                  !editMode ? "invisible" : ""
                }`}
                onClick={() => {
                  targetChainsStore.setTargetChainConfig({
                    address: wallet.userEntryAddress,
                    chainId: assets.chain.chainId,
                    config: { enabled: true },
                  });
                }}
                disabled={!editMode}
              >
                Enable
              </Button>
              <Button
                style={
                  targetChainConfig.enabled === false
                    ? {}
                    : { backgroundColor: "#32c9af" }
                }
                className={`network-disable-button bg-accent !h-5 rounded leading-5 text-white ${
                  !editMode ? "invisible" : ""
                }`}
                onClick={() => {
                  targetChainsStore.setTargetChainConfig({
                    address: wallet.userEntryAddress,
                    chainId: assets.chain.chainId,
                    config: { enabled: false },
                  });
                }}
                disabled={!editMode}
              >
                Disable
              </Button>
              <Button
                style={
                  targetChainConfig.enabled === undefined
                    ? {}
                    : { backgroundColor: "#32c9af" }
                }
                className={`network-auto-button bg-accent !h-5 rounded leading-5 text-white ${
                  !editMode ? "invisible" : ""
                }`}
                onClick={() => {
                  targetChainsStore.setTargetChainConfig({
                    address: wallet.userEntryAddress,
                    chainId: assets.chain.chainId,
                    config: {},
                  });
                }}
                disabled={!editMode}
              >
                Auto
              </Button>
            </div>
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
  editMode?: boolean | undefined;
}) {
  const router = useRouter();
  const wallet = useCurrentWallet();
  const { viewingKeysStore } = useStore();

  const viewingKey = viewingKeysStore.getViewingKey({
    address: wallet?.userEntryAddress ?? "",
    assetId: asset.assetId,
  });
  const assetInfo = parseCaip19AssetId(asset.assetId);
  const isPrivateToken =
    assetInfo.chainId === SecretChainId.Secret &&
    assetInfo.namespace === "snip20";

  const createViewingKey = useCreateViewingKey();

  return (
    <li
      className="asset-row hover:bg-accent relative flex cursor-pointer justify-center py-1.5 hover:rounded-lg hover:opacity-70"
      onClick={() => {
        router.push(
          editMode
            ? `/dashboard/tokens/edit/${encodeURIComponent(asset.assetId)}`
            : `/dashboard/transaction/send/${encodeURIComponent(asset.assetId)}`,
        );
      }}
    >
      <div className="asset-row-content flex w-[55%] justify-between gap-x-4 pl-4 pr-6 max-sm:w-[60%]">
        <div className="asset-row-info flex flex-row items-center gap-x-4">
          {asset.assetInfo?.image ? (
            <img
              src={asset.assetInfo.image}
              alt={asset.assetInfo.symbol}
              className="asset-row-icon h-6 w-6 sm:h-8 sm:w-8"
            />
          ) : (
            <div className="asset-row-icon-placeholder h-6 w-6 sm:h-8 sm:w-8" />
          )}
          <Text
            fontWeight="bold"
            className="asset-row-symbol text-white max-sm:text-sm"
          >
            {asset.assetInfo?.symbol}
          </Text>
        </div>
        {isPrivateToken ? (
          viewingKey ? (
            editMode ? (
              <Button
                variant="primary"
                className="asset-row-remove-viewing-key bg-accent -ml-6 h-5 rounded text-white max-sm:text-sm"
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
              <Text className="asset-row-viewing-key text-right tabular-nums max-sm:text-sm">
                {asset.prettyAmount.toString()}
              </Text>
            )
          ) : (
            <>
              <AsyncButton
                variant="primary"
                className="asset-row-create-viewing-key bg-accent -ml-6 h-5 rounded text-white max-sm:text-sm"
                onClick={async (e) => {
                  e.stopPropagation();
                  await createViewingKey(asset.assetId);
                }}
              >
                Create Viewing Key
              </AsyncButton>
            </>
          )
        ) : (
          <Text className="asset-row-amount text-center tabular-nums max-sm:text-sm">
            {asset.prettyAmount.toString()}
          </Text>
        )}
      </div>
      <div className="asset-row-value flex w-[45%] items-center justify-end gap-x-4 max-sm:w-[40%] sm:flex sm:flex-none">
        {isPrivateToken ? (
          viewingKey ? (
            editMode ? (
              <Button
                variant="primary"
                className="asset-row-remove-viewing-key bg-accent -ml-6 h-5 rounded text-white max-sm:text-sm"
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
              <Text className="asset-row-viewing-key -ml-6 h-5 max-sm:text-sm">
                {asset.prettyAmount.toString()}
              </Text>
            )
          ) : (
            <>
              <AsyncButton
                variant="primary"
                className="asset-row-create-viewing-key bg-accent -ml-6 h-5 rounded text-white max-sm:text-sm"
                onClick={async (e) => {
                  e.stopPropagation();
                  await createViewingKey(asset.assetId);
                }}
              >
                Create Viewing Key
              </AsyncButton>
            </>
          )
        ) : (
          <div>
            <Text
              fontWeight="bold"
              className="asset-row-value tabular-nums max-sm:pr-4 max-sm:text-sm"
            >
              ${new BigNumber(asset.usdBalance).toFixed(2)}
            </Text>
          </div>
        )}
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
    balances.length > 0 &&
    balances.every((b) => {
      return b.isLoading;
    })
  ) {
    return { status: PrettyBalancesStatus.Loading, data: [] };
  }

  const hasAnyData = balances.some((b) => {
    return b.data && b.data.length > 0;
  });
  if (!hasAnyData) {
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
          // Filter out zero balances
          const amount = new BigNumber(asset.rawAmount);
          if (amount.isZero()) {
            return false;
          }
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
    .filter((chainBalance) => {
      // Filter out chains that have no non-zero balances
      return chainBalance.prettyData.length > 0;
    })
    .sort((balanceA, balanceB) => {
      if (balanceA.usdValue.lt(balanceB.usdValue)) return 1;
      return -1;
    });

  return {
    status:
      data.length > 0
        ? PrettyBalancesStatus.SomeAssets
        : PrettyBalancesStatus.NoAssets,
    data,
  };
}
