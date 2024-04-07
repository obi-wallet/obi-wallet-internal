import { Button, Text } from "@/components";
import {
  IntentionsPayload,
  IntentionsResult,
  PasskeyIntentionsHandler,
} from "@/keys/intentions-handler";
import { Key, KeyType, MultisigKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useEffectOnceWhen } from "rooks";

export interface ApproveIntentionsProps {
  multisigKey: MultisigKey;
  intentions: IntentionsPayload;
  onApprove(result: Map<string, IntentionsResult>): void;
}

export const ApproveIntentions = observer<ApproveIntentionsProps>(
  function ApproveIntentions({ multisigKey, intentions, onApprove }) {
    const threshold = multisigKey.threshold;

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
            <Button
              className="mt-4"
              block
              onClick={async () => {
                const passkey = multisigKey.getKeysOfType(KeyType.Passkey)[0];
                const intentionsHandler = new PasskeyIntentionsHandler(
                  passkey!,
                );
                const result = await intentionsHandler.handle(intentions);
                setResult(passkey!, result);
              }}
              variant={threshold > confirmedKeyCount ? "primary" : "confirmed"}
              // disabled={threshold === confirmedKeyCount}
            >
              Passkey
            </Button>
          </div>
        </div>
      </div>
    );
  },
);
