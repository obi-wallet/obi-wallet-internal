import { useFocusEffect } from "@react-navigation/native";
import {
  QueryKey,
  // eslint-disable-next-line no-restricted-imports
  useQuery as useOriginalQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useCallback, useRef } from "react";

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
  const firstTimeRef = useRef(true);

  const result = useOriginalQuery(query);
  const { isStale, refetch } = result;

  const refetchIfStale = useCallback(() => {
    // Skip first time because we don't want to refetch on mount
    if (firstTimeRef.current) {
      firstTimeRef.current = false;
      return;
    }

    if (isStale) {
      void refetch({
        cancelRefetch: false,
      });
    }
  }, [isStale, refetch]);

  useFocusEffect(refetchIfStale);

  return result;
}
