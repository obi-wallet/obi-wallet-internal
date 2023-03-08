import {
  useQuery as useOriginalQuery,
  UseQueryOptions,
  QueryKey,
} from "@tanstack/react-query";
import { UseQueryResult } from "@tanstack/react-query/src/types";
import { Duration, DurationLikeObject } from "luxon";
import { useEffect } from "react";

import { useRootNavigation } from "../app/root-stack";

export function staleTime(duration: DurationLikeObject) {
  return Duration.fromObject(duration).toMillis();
}

export function useQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  query: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "initialData"
  > & { initialData?: () => undefined }
): UseQueryResult<TData, TError> {
  const navigation = useRootNavigation();

  const result = useOriginalQuery(query);

  useEffect(() => {
    return navigation.addListener("focus", async () => {
      if (result.isStale) {
        await result.refetch({
          cancelRefetch: false,
        });
      }
    });
  }, [result, navigation]);

  return result;
}
