import { KeyItem, Text } from "@/components";
import { useAlert } from "@/hooks/alert";
import {
  IntentionsPayload,
  IntentionsResult,
  PasskeyIntentionsHandler,
} from "@/keys/intentions-handler";
import { MultisigKeyDecryption } from "@/lib/encryption";
import { useKeyListForMultisigKey } from "@/lib/keys";
import { cn } from "@/lib/utils";
import { KeyMetaData } from "@/stores/key-meta-data";
import { AsyncButton } from "@/ui/button";
import { PhoneKeyModal } from "@/user-interactions/approve-intentions/modals/phone";
import { Key, KeyType, MultisigKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useEffectOnceWhen } from "rooks";

export const IntentionsResults = Map<string, IntentionsResult>;
export type IntentionsResults = Map<string, IntentionsResult>;

export async function handleMultisigKeyDecryptedMessages({
  multisigKeyEncryptedMessages,
  multisigKey,
  results,
}: {
  multisigKeyEncryptedMessages: string[];
  multisigKey: MultisigKey;
  results: IntentionsResults;
}): Promise<string[]> {
  return await Promise.all(
    multisigKeyEncryptedMessages.map(async (message, index) => {
      return await handleMultisigKeyDecryptedMessage({
        multisigKeyEncryptedMessage: message,
        multisigKey,
        results,
        index,
      });
    }),
  );
}

export async function handleMultisigKeyDecryptedMessage({
  multisigKeyEncryptedMessage,
  multisigKey,
  results,
  index,
}: {
  multisigKeyEncryptedMessage: string;
  multisigKey: MultisigKey;
  results: IntentionsResults;
  index: number;
}) {
  const decryptedShares = multisigKey.keys.map((key) => {
    return results.get(key.publicKey.value)?.decryptedShares[index] ?? null;
  });
  const decryption = new MultisigKeyDecryption(decryptedShares);
  return await decryption.decrypt(multisigKeyEncryptedMessage);
}

export interface ApproveIntentionsProps {
  multisigKey: MultisigKey;
  keyMetaData: KeyMetaData;
  intentions: IntentionsPayload;
  onApprove(result: IntentionsResults): void;
}

export const ApproveIntentions = observer<ApproveIntentionsProps>(
  function ApproveIntentions({
    multisigKey,
    keyMetaData,
    intentions,
    onApprove,
  }) {
    const threshold = multisigKey.threshold;
    const keyList = useKeyListForMultisigKey({
      multisigKey,
      keyMetaData,
    });
    const [modal, setModal] = useState<{
      key: KeyItem;
      index: number;
    } | null>(null);

    const [results, setResults] = useState(new IntentionsResults());
    const alert = useAlert();

    const getResult = (key: Key) => {
      return results.get(key.publicKey.value);
    };

    const setResultWithKey = (key: Key, result: IntentionsResult) => {
      setResults((map) => {
        return new Map(map.set(key.publicKey.value, result));
      });
    };

    const setResultWithPublicKey = (
      publicKey: string,
      result: IntentionsResult,
    ) => {
      setResults((map) => {
        return new Map(map.set(publicKey, result));
      });
    };

    useEffectOnceWhen(() => {
      onApprove(results);
    }, results.size >= threshold);

    const confirmedKeyCount = results.size;

    const handleClick = async (key: KeyItem, index: number) => {
      try {
        switch (key.key.type) {
          case KeyType.Passkey: {
            const intentionsHandler = new PasskeyIntentionsHandler({
              owner: multisigKey,
              payload: intentions,
            });
            const result = await intentionsHandler.handle();
            setResultWithPublicKey(result.publicKey, result.intentionsResult);
            break;
          }

          case KeyType.Telegram: {
            setModal({
              key,
              index,
            });
            break;
          }
        }
      } catch (e) {
        console.error(e);
        if (e instanceof Error) {
          alert.showError(`Could not process key: ${e.message}`);
        } else {
          alert.showError("An unknown error occurred while processing the key");
        }
      }
    };

    return (
      <div className="relative w-full">
        <div className="flex justify-center">
          <div className="flex w-full flex-col items-center">
            <Text className={cn("mt-4", "max-md:mt-2")}>{`${threshold} Key${
              threshold > 1 ? "s" : ""
            } Required`}</Text>
            {renderKeyModal()}
            {keyList.map((keyData) => {
              return keyData.keys.map((key) => {
                return (
                  <AsyncButton
                    key={key.id}
                    className={cn("mt-4 w-full", "max-md:mt-2")}
                    block
                    onClick={() => {
                      return handleClick(
                        key,
                        multisigKey.keys.findIndex((k) => {
                          return k.publicKey.value === key.key.publicKey.value;
                        }),
                      );
                    }}
                    variant={getResult(key.key) ? "confirmed" : "primary"}
                    disabled={
                      !!getResult(key.key) || threshold <= confirmedKeyCount
                    }
                  >
                    {key.label}
                  </AsyncButton>
                );
              });
            })}
          </div>
        </div>
      </div>
    );

    function renderKeyModal() {
      if (!modal) return null;

      return (
        <PhoneKeyModal
          keyItem={modal.key}
          index={modal.index}
          intentions={intentions}
          onCancel={() => {
            setModal(null);
          }}
          onResult={(results) => {
            setModal(null);
            setResultWithKey(modal.key.key, results);
          }}
        />
      );
    }
  },
);
