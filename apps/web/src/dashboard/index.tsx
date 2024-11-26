"use client";

import { Button, Divider, Text } from "@/components";
import { useStore } from "@/contexts";
import { PrettyCaip19Asset, useBalances } from "@/hooks/balances";
import { useCreateViewingKey } from "@/hooks/use-create-viewing-key";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { allTargetChainIds, TargetChain, TargetChainId } from "@/target-chain";
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
    <div className="bg-background text-roboto-mono flex w-full flex-col text-white">
      <Assets />
    </div>
  );
});

const Assets = observer(function Assets() {
  const [searchAsset, setSearchAsset] = useState("");
  const [editMode, setEditMode] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="text-roboto-mono min-w-0 flex-[1_1_0] text-sm text-white">
          <Input
            className="bg-background-secondary border-primary h-9 w-full rounded px-3 py-1.5"
            leftComponent={<CiSearch className="h-6 w-6" />}
            labelClassname="bg-background-secondary"
            placeholder="Search"
            value={searchAsset}
            onChange={(asset) => {
              return setSearchAsset(asset);
            }}
            inputClassName="ml-2 bg-transparent placeholder-white"
          />
        </div>

        <div className="min-w-0 flex-[1_1_0]">
          <Button
            onClick={() => {
              return setEditMode((value) => {
                return !value;
              });
            }}
            variant="accent"
            size="md"
            className="w-full"
          >
            {editMode ? "Hide Assets" : "Show Assets"}
          </Button>
        </div>

        <div className="min-w-0 flex-[1_1_0]">
          <Button
            href="/dashboard/tokens/add"
            variant="primary-outline"
            size="md"
            leading="none"
            className={`w-full border-dashed ${!editMode ? "invisible" : ""}`}
          >
            + Import New Asset
          </Button>
        </div>
      </div>

      <Divider className="border-primary mt-1 hidden md:block" />

      {editMode ? (
        <EditMode searchAsset={searchAsset.toLowerCase()} />
      ) : (
        <>
          <PendingAssets />
          <AssetBalance searchAsset={searchAsset.toLowerCase()} />
          <div className="mt-10 flex w-full min-w-0 flex-row items-center justify-center max-md:px-2">
            <Text
              size="sm"
              className="text-roboto-mono break-words text-center font-light leading-normal text-white"
            >
              Fast Travel or Tunnel transactions may take a few minutes to be
              processed and will appear here once visible on the network.
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
    return (
      <span className="text-roboto-mono font-extrabold text-white">
        Loading
      </span>
    );
  }

  if (prettyBalances.status === PrettyBalancesStatus.NoAssets) {
    return (
      <span className="text-roboto-mono font-extrabold text-white">
        No Assets
      </span>
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
            className="text-[10px] uppercase text-slate-400 text-roboto-mono"
          >
            Asset
          </Text>

          <Text
            fontWeight="light"
            className="text-[10px] uppercase text-slate-400 text-roboto-mono max-sm:hidden"
          >
            Balance
          </Text>
        </div>

        <div className="flex w-1/4 items-center justify-end gap-x-4 sm:flex-none">
          <Text
            fontWeight="light"
            className="pr-4 text-[10px] uppercase text-slate-400 text-roboto-mono sm:hidden"
          >
            Balance
          </Text>
          <Text
            fontWeight="light"
            className="text-[10px] uppercase text-slate-400 text-roboto-mono max-sm:hidden"
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
    <div className="scrollbar-hide relative py-1.5">
      <div className="sticky top-0 z-10">
        <h3 className="bg-primary flex h-9 items-center gap-2.5 rounded px-2.5 py-[5px]">
          <div className="flex flex-1 flex-row">
            {/* <img
              src={assets.chain.image}
              alt={assets.chain.label}
              className="h-5 w-5 sm:h-8 sm:w-8"
            /> */}
            <Text className="text-background text-roboto-mono text-base">
              {assets.chain.label}
            </Text>
            <div className="flex flex-grow justify-end text-right">
              <Button
                style={
                  targetChainConfig.enabled === true
                    ? {}
                    : { backgroundColor: "#32c9af" }
                }
                className={`bg-accent text-roboto-mono h-5 rounded text-white ${
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
                className={`bg-accent text-roboto-mono h-5 rounded text-white ${
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
                className={`bg-accent text-roboto-mono h-5 rounded text-white ${
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
      className="hover:bg-accent relative flex cursor-pointer justify-center py-1.5 hover:rounded-lg hover:opacity-70"
      onClick={() => {
        router.push(
          editMode
            ? `/dashboard/tokens/edit/${encodeURIComponent(asset.assetId)}`
            : `/dashboard/transaction/send/${encodeURIComponent(asset.assetId)}`,
        );
      }}
    >
      <div className="flex w-[55%] justify-between gap-x-4 pl-4 pr-6 max-sm:w-[60%]">
        <div className="flex flex-row items-center gap-x-4">
          {asset.assetInfo?.image ? (
            <img
              src={asset.assetInfo.image}
              alt={asset.assetInfo.symbol}
              className="h-6 w-6 sm:h-8 sm:w-8"
            />
          ) : (
            <div className="h-6 w-6 sm:h-8 sm:w-8" />
          )}
          <Text
            fontWeight="bold"
            className="text-roboto-mono text-white max-sm:text-sm"
          >
            {asset.assetInfo?.symbol}
          </Text>
        </div>
        {isPrivateToken ? (
          viewingKey ? (
            editMode ? (
              <Button
                variant="primary"
                className="bg-accent text-roboto-mono -ml-6 h-5 rounded text-white max-sm:text-sm"
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
              <Text className="text-roboto-mono text-right tabular-nums max-sm:text-sm">
                {asset.prettyAmount.toString()}
              </Text>
            )
          ) : (
            <>
              <AsyncButton
                variant="primary"
                className="bg-accent text-roboto-mono -ml-6 h-5 rounded text-white max-sm:text-sm"
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
          <Text className="text-roboto-mono text-center tabular-nums max-sm:text-sm">
            {asset.prettyAmount.toString()}
          </Text>
        )}
      </div>
      <div className="flex w-[45%] items-center justify-end gap-x-4 max-sm:w-[40%] sm:flex sm:flex-none">
        {isPrivateToken ? (
          viewingKey ? (
            editMode ? (
              <Button
                variant="primary"
                className="bg-accent text-roboto-mono -ml-6 h-5 rounded text-white max-sm:text-sm"
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
              <Text className="text-roboto-mono -ml-6 h-5 max-sm:text-sm">
                {asset.prettyAmount.toString()}
              </Text>
            )
          ) : (
            <>
              <AsyncButton
                variant="primary"
                className="bg-accent text-roboto-mono -ml-6 h-5 rounded text-white max-sm:text-sm"
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
              className="text-roboto-mono tabular-nums max-sm:pr-4 max-sm:text-sm"
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
