import { QueryClient } from "@tanstack/query-core";
import { Duration, DurationLikeObject } from "luxon";

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

  public createQuery<TFnParams, TFnReturn>({
    name,
    fn,
    params,
  }: {
    name: string;
    fn: (args: TFnParams) => Promise<TFnReturn>;
    params: TFnParams;
  }) {
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
