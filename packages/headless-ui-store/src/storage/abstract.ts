export interface AbstractStorage<T> {
  get(): Promise<T | undefined>;
  set(data: T): Promise<void>;
  remove(): Promise<void>;
}
