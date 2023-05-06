import { z } from "zod";

export abstract class AbstractClient {
  public abstract queryContract<T extends z.ZodTypeAny>({
    contract,
    query,
    schema,
  }: {
    contract: string;
    query: unknown;
    schema: T;
  }): Promise<z.infer<T>>;
}
