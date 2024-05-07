import { queryClient } from "@obi-wallet/query-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClientProviderProps as OriginalQueryClientProviderProps } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { observer } from "mobx-react-lite";
import { ComponentType, ReactNode } from "react";

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
  },
);

export const Provider = observer(function Provider({
  children,
  QueryClientProvider = QueryClientProviderWithPersister,
  buster,
}: {
  children: ReactNode;
  QueryClientProvider?: ComponentType<QueryClientProviderProps>;
  buster?: string;
}) {
  return (
    <QueryClientProvider client={queryClient} buster={buster}>
      {children}
    </QueryClientProvider>
  );
});
