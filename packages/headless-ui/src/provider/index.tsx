import { queryClient } from "@obi-wallet/query-client";
import { deserialize, serialize } from "@obi-wallet/sdk-json";
import { QueryClientProviderProps as OriginalQueryClientProviderProps } from "@tanstack/react-query";
import {
  PersistedClient,
  Persister,
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import { createInstance } from "localforage";
import { observer } from "mobx-react-lite";
import { ComponentType, ReactNode } from "react";

const tanstackPersistDb = createInstance({
  name: "ObiWallet",
  storeName: "tanstack-query-offline-cache",
});
const persister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await tanstackPersistDb.setItem("persisted-client", serialize(client));
  },
  restoreClient: async () => {
    const persistedClient =
      await tanstackPersistDb.getItem<string>("persisted-client");

    if (!persistedClient) {
      return undefined;
    }

    return deserialize(persistedClient);
  },
  removeClient: async () => {
    await tanstackPersistDb.removeItem("persisted-client");
  },
};

export type QueryClientProviderProps = OriginalQueryClientProviderProps & {
  buster?: string | undefined;
};

const QueryClientProviderWithPersister = observer<QueryClientProviderProps>(
  function QueryClientProviderWithPersister({ children, client, buster }) {
    return (
      <PersistQueryClientProvider
        client={client}
        persistOptions={{ persister, ...(buster ? { buster } : {}) }}
      >
        {children}
      </PersistQueryClientProvider>
    );
  },
);

export const Provider = observer(function Provider({
  children,
  QueryClientProvider = QueryClientProviderWithPersister,
  buster,
}: {
  children: ReactNode;
  QueryClientProvider?: ComponentType<QueryClientProviderProps> | undefined;
  buster?: string | undefined;
}) {
  return (
    <QueryClientProvider client={queryClient} buster={buster}>
      {children}
    </QueryClientProvider>
  );
});
