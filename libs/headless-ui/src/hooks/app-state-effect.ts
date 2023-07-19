import { DependencyList, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

export function useAppStateEffect(
  fn: (appState: AppStateStatus) => void,
  deps: DependencyList,
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const listener = AppState.addEventListener("change", (appState) => {
      fnRef.current(appState);
    });
    return () => {
      // At least in tests, listener can also be undefined
      listener?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
