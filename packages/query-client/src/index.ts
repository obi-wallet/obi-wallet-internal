import {
  FetchQueryOptions,
  MutationCache,
  Query,
  QueryCache,
  QueryClient,
  skipToken,
  WithRequired,
} from "@tanstack/query-core";
import { Duration, DurationLikeObject } from "luxon";

export function queryClientDuration(duration: DurationLikeObject) {
  return Duration.fromObject(duration).toMillis();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: queryClientDuration({ day: 1 }),
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error("Error thrown during query", query.queryKey, error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, _mutation) => {
      console.error("Error thrown during mutation", error);
    },
  }),
});

// eslint-disable-next-line etc/prefer-interface
export type NamespacedQuery<TFnParams, TFnReturn> = (
  params: TFnParams,
) => Pick<
  WithRequired<FetchQueryOptions<TFnReturn>, "queryKey" | "queryFn">,
  "queryKey" | "queryFn" | "staleTime"
>;

export function makeNamespacedQueryParamsOptional<TFnParams, TFnReturn>(
  query: NamespacedQuery<TFnParams, TFnReturn>,
): NamespacedQuery<TFnParams | undefined, TFnReturn | undefined> {
  // @ts-expect-error This should be fine
  return (params: TFnParams | undefined) => {
    // This type assertion is safe since we only call queryFn if params is defined.
    const queryResult = query(params!);
    return {
      ...queryResult,
      queryFn: params === undefined ? skipToken : queryResult.queryFn,
    };
  };
}

export class QueryClientNamespace<
  TNamespace extends string = string,
  TNamespaceParams extends Record<string, unknown> = Record<string, unknown>,
> {
  public constructor(
    protected namespace: TNamespace,
    protected namespaceParams: TNamespaceParams,
  ) {}

  public createQuery<TFnParams, TFnReturn>(queryInfo: {
    name: string;
    staleTime?:
      | DurationLikeObject
      | ((query: Query<TFnReturn>) => DurationLikeObject);
    fn: (args: TFnParams) => Promise<TFnReturn>;
  }): NamespacedQuery<TFnParams, TFnReturn> {
    return (params: TFnParams) => {
      return {
        queryKey: [
          {
            namespace: this.namespace,
            params: this.namespaceParams,
          },
          {
            fn: queryInfo.name,
            params,
          },
        ],
        queryFn: (): Promise<TFnReturn> => {
          return queryInfo.fn(params);
        },
        staleTime: queryInfo.staleTime
          ? (query) => {
              const staleTime =
                typeof queryInfo.staleTime === "function"
                  ? queryInfo.staleTime(query)
                  : queryInfo.staleTime!;
              return queryClientDuration(staleTime);
            }
          : undefined,
      };
    };
  }
}
