import { isObservable, isObservableProp } from "mobx";
import invariant from "tiny-invariant";

export function expectIsPureObject(serialized: unknown) {
  expect(isObservable(serialized)).toEqual(false);
  JSON.stringify(serialized, function (key, value) {
    invariant(!isObservableProp(this, key), `Key ${key} is observable prop`);
    invariant(!isObservable(value), `Key ${key} is observable`);
    return value;
  });
}
