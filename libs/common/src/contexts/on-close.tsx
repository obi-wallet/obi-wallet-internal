import { createContext, useContext } from "react";

export const OnCloseContext = createContext<(() => void) | undefined>(
  undefined
);

export function useOnClose() {
  return useContext(OnCloseContext);
}
