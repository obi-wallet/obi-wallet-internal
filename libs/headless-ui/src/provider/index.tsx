import { queryClient } from "@obi-wallet/sdk";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClientProviderProps } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { observer } from "mobx-react-lite";
import { ComponentType, ReactNode } from "react";

import { RootStoreProvider } from "./root-store";
import { RootStore } from "../store";

export * from "./root-store";

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

const QueryClientProviderWithPersister = observer<QueryClientProviderProps>(
  function QueryClientProviderWithPersister({ children, client }) {
    return (
      <PersistQueryClientProvider
        client={client}
        persistOptions={{ persister }}
      >
        {children}
      </PersistQueryClientProvider>
    );
  }
);

export const Provider = observer(function Provider({
  children,
  QueryClientProvider = QueryClientProviderWithPersister,
  rootStore,
}: {
  children: ReactNode;
  QueryClientProvider?: ComponentType<QueryClientProviderProps>;
  rootStore: RootStore;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <RootStoreProvider value={rootStore}>{children}</RootStoreProvider>
    </QueryClientProvider>
  );
});
