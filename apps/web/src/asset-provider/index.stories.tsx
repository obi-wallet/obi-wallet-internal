import { AbstractAssetProvider, AssetInfo } from "@/asset-provider/abstract";
import { ChainRegistryAssetProvider } from "@/asset-provider/chain-registry-asset-provider";
import { AssetProvider } from "@/asset-provider/index";
import { AstroportAssetProvider } from "@/astroport";
import { AssetRow, AssetsContainer } from "@/dashboard";
import { SkipAssetProvider } from "@/skip";
import { SquidAssetProvider } from "@/squid";
import { dashboardLayoutDecorator } from "@/storybook-helpers/layouts";
import { allTargetChainIds } from "@/target-chain";
import {
  Caip19AssetId,
  Caip2ChainId,
  parseCaip19AssetId,
} from "@obi-wallet/sdk-caip";
import { StoryObj } from "@storybook/react";
import { useState } from "react";
import { useEffectOnceWhen } from "rooks";

function AssetProviderRenderer({
  assetProvider,
}: {
  assetProvider: AbstractAssetProvider;
}) {
  const [supportedAssets, setSupportedAssets] = useState<Caip19AssetId[]>([]);

  useEffectOnceWhen(async () => {
    setSupportedAssets(await assetProvider.supportedAssets());
  });

  const relevantSupportedAssets = supportedAssets.filter((asset) => {
    const { chainId } = parseCaip19AssetId(asset);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (allTargetChainIds as Caip2ChainId[]).includes(chainId);
  });

  console.log(relevantSupportedAssets);

  return (
    <AssetsContainer>
      {relevantSupportedAssets.map((asset) => {
        return (
          <AsyncAssetRow key={asset} id={asset} assetProvider={assetProvider} />
        );
      })}
    </AssetsContainer>
  );
}

function AsyncAssetRow({
  id,
  assetProvider,
}: {
  id: Caip19AssetId;
  assetProvider: AbstractAssetProvider;
}) {
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null);

  useEffectOnceWhen(async () => {
    setAssetInfo(await assetProvider.assetInfo(id));
  });

  if (!assetInfo) {
    return null;
  }

  return (
    <AssetRow
      asset={{
        assetId: id,
        price: "0",
        usdBalance: "0",
        rawAmount: "0",
        prettyAmount: "0",
        assetInfo,
      }}
    />
  );
}

const meta = {
  title: "Asset Providers/Supported Assets",
  component: AssetProviderRenderer,
  decorators: [dashboardLayoutDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Singleton: Story = {
  args: {
    assetProvider: AssetProvider.getInstance(),
  },
};

export const Astroport: Story = {
  args: {
    assetProvider: new AstroportAssetProvider(),
  },
};

export const ChainRegistry: Story = {
  args: {
    assetProvider: new ChainRegistryAssetProvider(),
  },
};

export const Skip: Story = {
  args: {
    assetProvider: new SkipAssetProvider(),
  },
};

export const Squid: Story = {
  args: {
    assetProvider: new SquidAssetProvider(),
  },
};
