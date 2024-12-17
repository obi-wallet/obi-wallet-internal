import { KeyItem, Modal, Text } from "@/components";
import { useAlert } from "@/hooks/alert";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import {
  IntentionsPayload,
  IntentionsResult,
  KeyPairIntentionsHandler,
  PasskeyIntentionsHandler,
} from "@/keys/intentions-handler";
import { useKeyListForMultisigKey } from "@/lib/keys";
import { cn } from "@/lib/utils";
import { KeyMetaData } from "@/stores/key-meta-data";
import { AsyncButton } from "@/ui/button";
import { PhoneKeyModal } from "@/user-interactions/approve-intentions/modals/phone";
import { KeySchema, KeyType, MultisigKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useEffectOnceWhen } from "rooks";
import { z } from "zod";

import { IntentionsResults } from "./utils";

interface CloudKeyFile {
  id: string;
  name: string;
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
    const [cloudKeysModal, setCloudKeysModal] = useState<CloudKeyFile[] | null>(
      null,
    );

    const [results, setResults] = useState(new IntentionsResults());
    const alert = useAlert();
    const { readFiles, readFileById } = useGoogleAuth();

    const getResult = (key: z.infer<typeof KeySchema>) => {
      return results.get(key.publicKey.value);
    };

    const setResultWithKey = (
      key: z.infer<typeof KeySchema>,
      result: IntentionsResult,
    ) => {
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
      switch (key.key.type) {
        case KeyType.Passkey: {
          try {
            const intentionsHandler = new PasskeyIntentionsHandler({
              owner: multisigKey,
              payload: intentions,
            });
            const result = await intentionsHandler.handle();
            setResultWithPublicKey(result.publicKey, result.intentionsResult);
          } catch (e) {
            console.error(e);
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const error = e as Error;
            alert.showError(
              `It looks like you used the wrong passkey! Try another passkey. Error: ${error.message}`,
            );
          }
          break;
        }

        case KeyType.Phone:
        case KeyType.Telegram: {
          setModal({
            key,
            index,
          });
          break;
        }

        case KeyType.Cloud: {
          const files = await readFiles();
          const keyFiles = files
            ?.filter((file) => {
              return file.name.startsWith("obi-");
            })
            .filter((file) => {
              return file.name.endsWith(".key");
            });
          if (keyFiles) {
            setCloudKeysModal(keyFiles);
          }
          break;
        }
      }
    };

    return (
      <>
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
                      onClick={async () => {
                        await handleClick(
                          key,
                          multisigKey.keys.findIndex((k) => {
                            return (
                              k.publicKey.value === key.key.publicKey.value
                            );
                          }),
                        );
                      }}
                      variant={getResult(key.key) ? "primary" : "primary"}
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
        {renderCloudKeysModal()}
      </>
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

    function renderCloudKeysModal() {
      if (!cloudKeysModal) {
        return null;
      }
      const onClose = () => {
        setCloudKeysModal(null);
      };

      return (
        <Modal
          title="Cloud Key"
          boxClassname="h-fit w-2/5 !w-[320px] !min-w-[320px] px-4 py-6 max-sm:w-full"
          onClose={onClose}
        >
          <section className="flex max-h-[400px] flex-col items-center space-y-4 overflow-y-auto">
            {cloudKeysModal &&
              cloudKeysModal.map((file, index) => {
                return (
                  <AsyncButton
                    key={index}
                    onClick={async () => {
                      const keyPair = await readFileById(file.id);
                      if (keyPair) {
                        try {
                          const keyIntentionsHandler =
                            new KeyPairIntentionsHandler({
                              owner: multisigKey,
                              payload: intentions,
                              keyPair,
                              type: KeyType.Cloud,
                            });
                          const result = await keyIntentionsHandler.handle();
                          setResultWithPublicKey(
                            result.publicKey,
                            result.intentionsResult,
                          );
                          setCloudKeysModal(null);
                        } catch (e) {
                          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                          const error = e as Error;
                          console.error(error);
                          alert.showError(
                            `Could not process cloud key: ${error.message}`,
                          );
                        }
                      }
                    }}
                    className="block w-full"
                    variant="primary"
                  >
                    {file.name}
                  </AsyncButton>
                );
              })}
          </section>
        </Modal>
      );
    }
  },
);
