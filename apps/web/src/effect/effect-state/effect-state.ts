import { Context, Effect, Ref, SubscriptionRef } from "effect";

export class EffectState<T> {
  protected constructor(protected ref: SubscriptionRef.SubscriptionRef<T>) {}

  public static make<T>(initialValue: T) {
    return Effect.gen(function* () {
      const ref = yield* SubscriptionRef.make(initialValue);
      return new EffectState(ref);
    });
  }

  public get() {
    return Effect.gen(this, function* () {
      return yield* Ref.get(this.ref);
    });
  }

  public set(fn: (prevState: T) => T) {
    return Effect.gen(this, function* () {
      yield* Ref.update(this.ref, fn);
    });
  }

  public get changes() {
    return this.ref.changes;
  }
}

export type EffectStateTag = Context.Tag<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EffectState<any>
>;

export type EffectStateValue<T extends EffectStateTag> =
  Context.Tag.Service<T> extends EffectState<infer V> ? V : never;
