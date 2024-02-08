import { createContext, useContext } from "react";
import invariant from "tiny-invariant";

import { RootStore } from "../stores";

export const StoreContext = createContext<RootStore | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  invariant(ctx, "Store context is null");
  return ctx;
}
