import { FetchQueryOptions, QueryClient } from "@tanstack/query-core";
import { Duration, DurationLikeObject } from "luxon";
import * as R from "ramda";

export function queryClientDuration(duration: DurationLikeObject) {
  return Duration.fromObject(duration).toMillis();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: queryClientDuration({ day: 1 }),
    },
  },
});

export class QueryClientNamespace<
  TNamespace extends string = string,
  TNamespaceParams extends Record<string, unknown> = Record<string, unknown>
> {
  public constructor(
    protected namespace: TNamespace,
    protected namespaceParams: TNamespaceParams
  ) {}

  public createQuery<TFnParams, TFnReturn>(
    params: {
      name: string;
    } & (
      | {
          fn: () => Promise<TFnReturn>;
        }
      | {
          fn: (args: TFnParams) => Promise<TFnReturn>;
          params: TFnParams;
        }
    )
  ) {
    if (R.has("params", params)) {
      return this.createQueryWithParams(params);
    }

    return this.createQueryWithoutParams(params);
  }

  protected createQueryWithoutParams<TFnReturn>({
    name,
    fn,
  }: {
    name: string;
    fn: () => Promise<TFnReturn>;
  }): Pick<FetchQueryOptions<TFnReturn>, "queryKey" | "queryFn"> {
    return {
      queryKey: [
        {
          namespace: this.namespace,
          params: this.namespaceParams,
        },
        {
          fn: name,
        },
      ],
      queryFn: (): Promise<TFnReturn> => {
        return fn();
      },
    };
  }

  protected createQueryWithParams<TFnParams, TFnReturn>({
    name,
    fn,
    params,
  }: {
    name: string;
    fn: (args: TFnParams) => Promise<TFnReturn>;
    params: TFnParams;
  }): Pick<FetchQueryOptions<TFnReturn>, "queryKey" | "queryFn"> {
    return {
      queryKey: [
        {
          namespace: this.namespace,
          params: this.namespaceParams,
        },
        {
          fn: name,
          params,
        },
      ],
      queryFn: (): Promise<TFnReturn> => {
        return fn(params);
      },
    };
  }
}
