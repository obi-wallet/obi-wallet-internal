// eslint-disable-next-line etc/prefer-interface
export type FilterMapFn<T, R> = (
  value: T,
  index: number,
  array: T[],
) => Promise<R | null>;

export async function filterMap<T, R>(
  fn: FilterMapFn<T, R>,
  array: T[],
  options: {
    catchErrors?: boolean;
  } = {
    catchErrors: false,
  },
) {
  return (
    await Promise.all(array.map(options.catchErrors ? catchErrors(fn) : fn))
  ).filter((value): value is Awaited<R> => {
    return !!value;
  });
}

export function catchErrors<T, R>(fn: FilterMapFn<T, R>): FilterMapFn<T, R> {
  return async (value, index, array) => {
    try {
      return await fn(value, index, array);
    } catch (error) {
      console.error(error);
      return null;
    }
  };
}
