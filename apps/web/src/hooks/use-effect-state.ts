import {
  MultisigKeyEncryption,
  SharesEncryptionForClient,
} from "@/lib/encryption";
import {
  handleEncryptedEasyShare,
  handleMultisigKeyDecryptedMessages,
  handlePrimaryKeyDecryptedMessages,
} from "@/user-interactions/approve-intentions/utils";
import { EncryptionTools } from "@/wallet-data-flow-new/state";
import {
  EncryptedBackupShare,
  EncryptedEasyShareForBackup,
} from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";
import { Context, Effect, Fiber, Layer, Stream, SubscriptionRef } from "effect";
import { useCallback, useRef, useSyncExternalStore } from "react";

const encryptionToolsLayer = Layer.succeed(EncryptionTools, {
  encryptSharesForClient: async function ({ multisigKey, easy, backup }) {
    return await new SharesEncryptionForClient(multisigKey).encrypt({
      easy,
      backup,
    });
  },
  encryptSharesForBackup: async function ({ multisigKey, easy, backup }) {
    const multisigKeyEncryption = new MultisigKeyEncryption(
      multisigKey.publicKey,
    );
    return {
      easy: EncryptedEasyShareForBackup.parse(
        await multisigKeyEncryption.encrypt(serialize(easy)),
      ),
      backup: EncryptedBackupShare.parse(
        await multisigKeyEncryption.encrypt(serialize(backup)),
      ),
    };
  },
  encryptWithMultisigKey: async function ({ multisigKey, data }) {
    return await new MultisigKeyEncryption(multisigKey.publicKey).encrypt(data);
  },
  handleIntentions: async function ({
    multisigKey,
    intentionsPayload,
    results,
  }) {
    return {
      decryptedEasyShare: intentionsPayload.decryptEasyShare
        ? await handleEncryptedEasyShare({
            multisigKey,
            encryptedEasyShare: intentionsPayload.decryptEasyShare,
            results,
          })
        : null,
      decryptedPrimaryKeyEncryptedMessages:
        await handlePrimaryKeyDecryptedMessages({
          primaryKeyEncryptedMessages:
            intentionsPayload.decryptPrimaryKeyEncryptedMessages,
          multisigKey,
          results,
        }),
      decryptedMultisigKeyEncryptedMessages:
        await handleMultisigKeyDecryptedMessages({
          multisigKeyEncryptedMessages:
            intentionsPayload.decryptMultisigKeyEncryptedMessages,
          multisigKey,
          results,
        }),
    };
  },
});

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
            SubscriptionRef.make(initialStateRef.current),
          ) as Context.Tag.Service<T>,
        ),
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
      return yield* SubscriptionRef.get(state);
    });
    return Effect.runSync(Effect.provide(p, getLayer()));
  }
}
