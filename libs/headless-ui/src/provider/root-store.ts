import { createContext, useContext } from "react";

import { RootStore } from "../store";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const RootStoreContext = createContext<RootStore>(null!);

export const RootStoreProvider = RootStoreContext.Provider;

export function useRootStore() {
  return useContext(RootStoreContext);
}
