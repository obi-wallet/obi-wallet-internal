import invariant from "tiny-invariant";
import { z } from "zod";

export type Caip2Namespace = string;
export type Caip2Reference = string;
export type Caip2ChainId = `${Caip2Namespace}:${Caip2Reference}`;

export const Caip2ChainIdSchema = z.custom<Caip2ChainId>((value) => {
  const [namespace, reference] = value.split(":");
  return typeof namespace === "string" && typeof reference === "string";
});

export function parseCaip2ChainId(chainId: Caip2ChainId): {
  namespace: Caip2Namespace;
  reference: Caip2Reference;
} {
  const [namespace, reference] = chainId.split(":");
  invariant(typeof namespace === "string", "namespace must be a string");
  invariant(typeof reference === "string", "reference must be a string");
  return { namespace, reference };
}
