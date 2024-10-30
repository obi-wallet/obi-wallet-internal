import {
  IntentionsPayload,
  KeyPairIntentionsHandler,
} from "@/keys/intentions-handler";
import { IntentionsResults } from "@/user-interactions/approve-intentions/utils";
import { MultisigKey } from "@obi-wallet/sdk";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";

export async function mockApproveIntentions({
  multisigKey,
  keyPair,
  intentions,
  results,
}: {
  multisigKey: MultisigKey;
  keyPair: Secp256k1KeyPair;
  intentions: IntentionsPayload;
  results: IntentionsResults;
}) {
  const intentionsHandler = new KeyPairIntentionsHandler({
    owner: multisigKey,
    payload: intentions,
    keyPair,
    type: null,
  });
  const { intentionsResult, publicKey } = await intentionsHandler.handle();
  results.set(publicKey, intentionsResult);
}
