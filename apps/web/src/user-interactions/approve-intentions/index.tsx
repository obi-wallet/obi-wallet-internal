import { Button, KeyItem, Text } from "@/components";
import {
  IntentionsPayload,
  IntentionsResult,
  PasskeyIntentionsHandler,
} from "@/keys/intentions-handler";
import { MultisigKeyDecryption } from "@/lib/encryption";
import { useKeyListForMultisigKey } from "@/lib/keys";
import { KeyMetaData } from "@/stores/key-meta-data";
import { PhoneKeyModal } from "@/user-interactions/approve-intentions/modals/phone";
import { Key, KeyType, MultisigKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useEffectOnceWhen } from "rooks";

export async function handleMultisigKeyDecryptedMessages({
  multisigKeyEncryptedMessages,
  multisigKey,
  results,
}: {
  multisigKeyEncryptedMessages: string[];
  multisigKey: MultisigKey;
  results: Map<string, IntentionsResult>;
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
  results: Map<string, IntentionsResult>;
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
  onApprove(result: Map<string, IntentionsResult>): void;
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

    const [results, setResults] = useState(new Map<string, IntentionsResult>());

    const getResult = (key: Key) => {
      return results.get(key.publicKey.value);
    };

    const setResult = (key: Key, result: IntentionsResult) => {
      setResults((map) => {
        return new Map(map.set(key.publicKey.value, result));
      });
    };

    useEffectOnceWhen(() => {
      onApprove(results);
    }, results.size >= threshold);

    const confirmedKeyCount = results.size;

    return (
      <div className="relative w-full">
        <div className="flex justify-center">
          <div className="flex w-fit flex-col items-center">
            <Text className="mt-4">{`${threshold} Key${
              threshold > 1 ? "s" : ""
            } Required`}</Text>
            {renderKeyModal()}
            {keyList.map((keyData) => {
              return keyData.keys.map((key) => {
                return (
                  <Button
                    key={key.id}
                    className="mt-4"
                    block
                    onClick={async () => {
                      const index = multisigKey.keys.findIndex((k) => {
                        return k.publicKey.value === key.key.publicKey.value;
                      });

                      switch (key.key.type) {
                        case KeyType.Passkey: {
                          const intentionsHandler =
                            new PasskeyIntentionsHandler({
                              key: key.key,
                              keyMetaData: key.keyMetaData,
                              index,
                              payload: intentions,
                            });
                          const result = await intentionsHandler.handle();
                          setResult(key.key, result);
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
                    }}
                    variant={getResult(key.key) ? "confirmed" : "primary"}
                    disabled={
                      !!getResult(key.key) || threshold <= confirmedKeyCount
                    }
                  >
                    {key.label}
                  </Button>
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
            setResult(modal.key.key, results);
          }}
        />
      );
    }
  },
);
