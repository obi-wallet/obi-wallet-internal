import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FlatList, FlatListProps } from "react-native";

import { RefreshControl } from "./refresh-control";

export interface RefreshableFlatListProps<T> extends FlatListProps<T> {
  refetch: () => Promise<unknown>;
}

export const RefreshableFlatList = observer(function RefreshableFlatList<T>({
  refetch,
  ...props
}: RefreshableFlatListProps<T>) {
  const [refreshing, setRefreshing] = useState(false);

  return (
    <FlatList
      {...props}
      refreshControl={
        <RefreshControl
          refreshing={props.data === undefined || refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await refetch();
            setRefreshing(false);
          }}
        />
      }
    />
  );
});
