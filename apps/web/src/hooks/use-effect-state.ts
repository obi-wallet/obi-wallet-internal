import { Context, Effect, Fiber, Layer, Stream, SubscriptionRef } from "effect";
import { useCallback, useRef, useSyncExternalStore } from "react";

// maps a SubscriptionRef type to its inner value type
export type SubscriptionRefValue<T> =
  T extends SubscriptionRef.SubscriptionRef<infer V> ? V : never;

export type EffectStateTag = Context.Tag<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SubscriptionRef.SubscriptionRef<any>
>;

export type EffectStateValue<T extends EffectStateTag> = SubscriptionRefValue<
  Context.Tag.Service<T>
>;
export type EffectStateChanger<T extends EffectStateTag> = Effect.Effect<
  void,
  never,
  Context.Tag.Identifier<T>
>;

// eslint-disable-next-line etc/prefer-interface
export type EffectStateDispatch<T extends EffectStateTag> = (
  p: EffectStateChanger<T>,
) => Promise<void>;

export function useEffectState<T extends EffectStateTag>(
  Tag: T,
  initialState: EffectStateValue<T>,
): {
  state: EffectStateValue<T>;
  dispatch: EffectStateDispatch<T>;
} {
  const stateRef = useRef<Layer.Layer<Context.Tag.Identifier<T>> | null>(null);
  const initialStateRef = useRef<EffectStateValue<T>>(initialState);

  const getLayer = useCallback((): Layer.Layer<Context.Tag.Identifier<T>> => {
    if (stateRef.current === null) {
      stateRef.current = Layer.succeed(
        Tag,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        Effect.runSync(
          SubscriptionRef.make(initialStateRef.current),
        ) as Context.Tag.Service<T>,
      );
    }
    return stateRef.current;
  }, [Tag, initialStateRef]);

  const subscribe = useCallback(
    (listener: (n: EffectStateValue<T>) => void) => {
      const logger: Effect.Effect<
        void,
        never,
        Context.Tag.Identifier<T>
      > = Effect.gen(function* () {
        const state = yield* Tag;
        yield* Stream.runForEach(state.changes, (n) => {
          listener(n);
          return Effect.void;
        });
      });

      const fiber = Effect.runFork(Effect.provide(logger, getLayer()));

      return () => {
        Effect.runSyncExit(Fiber.interrupt(fiber));
      };
    },
    [Tag, getLayer],
  );

  const state = useSyncExternalStore(subscribe, getSnapshot);
  return {
    state,
    dispatch: async (
      p: Effect.Effect<void, never, Context.Tag.Identifier<T>>,
    ) => {
      await Effect.runPromise(Effect.provide(p, getLayer()));
    },
  };

  function getSnapshot(): EffectStateValue<T> {
    const p: Effect.Effect<
      EffectStateValue<T>,
      never,
      Context.Tag.Identifier<T>
    > = Effect.gen(function* () {
      const state = yield* Tag;
      return yield* SubscriptionRef.get(state);
    });
    return Effect.runSync(Effect.provide(p, getLayer()));
  }
}
