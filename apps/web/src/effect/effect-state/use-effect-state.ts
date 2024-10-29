import { EncryptionTools } from "@/effect/encryption-tools-layer";
import { encryptionToolsLayer } from "@/effect/encryption-tools-layer/production";
import { Context, Effect, Fiber, Layer, Stream } from "effect";
import { useCallback, useRef, useSyncExternalStore } from "react";

import { EffectState, EffectStateTag, EffectStateValue } from "./effect-state";

export type EffectStateChanger<T extends EffectStateTag> = Effect.Effect<
  void,
  never,
  Context.Tag.Identifier<T> | EncryptionTools
>;

// eslint-disable-next-line etc/prefer-interface
export type EffectStateDispatch<T extends EffectStateTag> = (
  p: EffectStateChanger<T>,
) => Promise<void>;

export function useEffectState<
  T extends EffectStateTag,
  F extends EffectStateValue<T>,
>(
  Tag: T,
  initialState: EffectStateValue<T>,
  endOptions?:
    | {
        isFinalState: (state: EffectStateValue<T>) => state is F;
        onDone: (state: F) => Promise<void>;
      }
    | undefined,
): {
  state: EffectStateValue<T>;
  dispatch: EffectStateDispatch<T>;
} {
  const stateRef = useRef<Layer.Layer<
    Context.Tag.Identifier<T> | EncryptionTools
  > | null>(null);
  const initialStateRef = useRef<EffectStateValue<T>>(initialState);
  const endOptionsRef = useRef(endOptions);

  const getLayer = useCallback((): Layer.Layer<
    Context.Tag.Identifier<T> | EncryptionTools
  > => {
    if (stateRef.current === null) {
      stateRef.current = Layer.merge(
        encryptionToolsLayer,
        Layer.succeed(
          Tag,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          Effect.runSync(
            EffectState.make(initialStateRef.current),
          ) as Context.Tag.Service<T>,
        ),
      );
    }
    return stateRef.current;
  }, [Tag, initialStateRef]);

  const subscribe = useCallback(
    (listener: (n: EffectStateValue<T>) => void) => {
      const notifier: Effect.Effect<
        void,
        never,
        Context.Tag.Identifier<T>
      > = Effect.gen(function* () {
        const state = yield* Tag;
        yield* Stream.runForEach(state.changes, (n) => {
          const endOptions = endOptionsRef.current;
          if (endOptions && endOptions.isFinalState(n)) {
            return Effect.promise(async () => {
              return await endOptions.onDone(n);
            });
          }

          listener(n);
          return Effect.void;
        });
      });

      const fiber = Effect.runFork(Effect.provide(notifier, getLayer()));

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
      p: Effect.Effect<
        void,
        never,
        Context.Tag.Identifier<T> | EncryptionTools
      >,
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
      return yield* state.get();
    });
    return Effect.runSync(Effect.provide(p, getLayer()));
  }
}
