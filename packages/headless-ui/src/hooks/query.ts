import {
  makeNamespacedQueryParamsOptional,
  NamespacedQuery,
} from "@obi-wallet/query-client";
// eslint-disable-next-line no-restricted-imports
import { useQuery as useOriginalQuery } from "@tanstack/react-query";

export const useQuery = useOriginalQuery;

export function useNamespacedQueryWithOptionalParams<TFnParams, TFnReturn>({
  query,
  params,
}: {
  query: NamespacedQuery<TFnParams, TFnReturn>;
  params: TFnParams | undefined;
}) {
  return useQuery(makeNamespacedQueryParamsOptional(query)(params));
}
