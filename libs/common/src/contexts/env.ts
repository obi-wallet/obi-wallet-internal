import { createContext, useContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Env {}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const EnvContext = createContext<Env>(null!);

export function useEnv() {
  return useContext(EnvContext);
}
