import { IntentionsHandler } from "@/keys/intentions-handler/abstract";
import { Secp256k1Decryption } from "@/lib/encryption";
import { getPasskey, Secp256k1PrivateKeySigner } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

export class PasskeyIntentionsHandler extends IntentionsHandler {
  public async handle(payload: {
    signHashes: Uint8Array[];
    decryptMessages: string[];
  }) {
    const keyPair = await getPasskey();
    invariant(
      keyPair.publicKey.value === this.key.publicKey.value,
      "Public key mismatch",
    );

    const signer = new Secp256k1PrivateKeySigner(keyPair.privateKey);
    const decryption = new Secp256k1Decryption(keyPair.privateKey);

    const [signedHashes, decryptedMessages] = await Promise.all([
      await Promise.all(
        payload.signHashes.map(async (hash) => {
          return await signer.signHash(hash);
        }),
      ),
      await Promise.all(
        payload.decryptMessages.map(async (message) => {
          return await decryption.decrypt(message);
        }),
      ),
    ]);

    return {
      signedHashes,
      decryptedMessages,
    };
  }
}
