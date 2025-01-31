import { Asset, AssetRegistry } from "@obi-wallet/sdk-asset-registry";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { useQueries } from "@tanstack/react-query";

export function useAssets(ids: Caip19AssetId[]) {
  const queries = useQueries({
    queries: ids.map((id) => {
      return {
        queryKey: ["asset", id],
        queryFn: () => {
          return AssetRegistry.getInstance().byId(id);
        },
      };
    }),
  });

  return Object.fromEntries(
    ids.map((id, index) => {
      const query = queries[index];
      return [id, query?.data ? new Asset(query.data) : null];
    }),
  );
}

export function useAsset(id: Caip19AssetId) {
  return useAssets([id])[id];
}
