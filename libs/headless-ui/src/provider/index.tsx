import { queryClient } from "@obi-wallet/sdk";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  focusManager,
  QueryClientProviderProps as OriginalQueryClientProviderProps,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { observer } from "mobx-react-lite";
import { ComponentType, ReactNode } from "react";
import { Platform } from "react-native";

import { RootStoreProvider } from "./root-store";
import { useAppStateEffect } from "../hooks";
import { RootStore } from "../store";

export * from "./root-store";

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export type QueryClientProviderProps = OriginalQueryClientProviderProps & {
  buster?: string;
};

const QueryClientProviderWithPersister = observer<QueryClientProviderProps>(
  function QueryClientProviderWithPersister({ children, client, buster }) {
    return (
      <PersistQueryClientProvider
        client={client}
        persistOptions={{ persister, buster }}
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
  buster,
}: {
  children: ReactNode;
  QueryClientProvider?: ComponentType<QueryClientProviderProps>;
  rootStore: RootStore;
  buster?: string;
}) {
  useAppStateEffect(
    (appState) => {
      const focused = appState === "active";

      if (Platform.OS !== "web") {
        focusManager.setFocused(focused);
      }

      if (!focused) return;
      void rootStore.recoverConnectors();
    },
    [rootStore]
  );

  return (
    <QueryClientProvider client={queryClient} buster={buster}>
      <RootStoreProvider value={rootStore}>{children}</RootStoreProvider>
    </QueryClientProvider>
  );
});
