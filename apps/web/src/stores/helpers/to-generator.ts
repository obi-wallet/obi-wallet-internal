export function* toGenerator<R>(p: Promise<R>) {
  return (yield p) as R;
}
