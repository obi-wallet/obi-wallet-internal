export function* toGenerator<R>(p: Promise<R>): Generator<Promise<R>, R, R> {
  return yield p;
}
