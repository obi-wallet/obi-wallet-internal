import { useCallback, useRef, useState } from "react";
import invariant from "tiny-invariant";

/**
 * Similar to `useState`, but also returns a `getAsync` function that resolves
 * when the state has been set.
 */
export function useAwaitableState<T>() {
  const [value, setValue] = useState<T | undefined>();
  const resolveRef = useRef<((_value: T) => void) | undefined>(undefined);
  const promiseRef = useRef<Promise<T> | undefined>(undefined);

  if (!promiseRef.current) {
    promiseRef.current = new Promise<T>((resolve) => {
      resolveRef.current = resolve;
    });
  }

  const getAsync = useCallback(async (): Promise<T> => {
    invariant(promiseRef.current, "Promise is not set");
    return await promiseRef.current;
  }, []);

  const set = useCallback(
    (value: T) => {
      setValue(value);
      resolveRef.current?.(value);
    },
    [setValue],
  );

  return {
    current: value,
    set,
    getAsync,
  };
}
