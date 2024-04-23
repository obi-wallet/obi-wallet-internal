import { NewIntentionsHandler } from "@/keys/intentions-handler/abstract";
import { Secp256k1Decryption } from "@/lib/encryption";
import {
  getPasskey,
  KeyType,
  Secp256k1PrivateKeySigner,
} from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

export class PasskeyIntentionsHandler extends NewIntentionsHandler {
  public async handle() {
    const keyPair = await getPasskey();
    const key = this.owner.keys.find((key) => {
      return key.publicKey.value === keyPair.publicKey.value;
    });
    invariant(
      key && key.type === KeyType.Passkey,
      "No passkey found with the given public key",
    );

    const signer = new Secp256k1PrivateKeySigner(keyPair.privateKey);
    const decryption = new Secp256k1Decryption(keyPair.privateKey);

    const messagesToDecrypt = this.getMessagesToDecrypt(
      keyPair.publicKey.value,
    );

    const [signedHashes, decryptedMessages] = await Promise.all([
      await Promise.all(
        this.payload.signHashes.map(async (hash) => {
          return await signer.signHash(hash);
        }),
      ),
      await Promise.all(
        messagesToDecrypt.map(async (message) => {
          return await decryption.decrypt(message);
        }),
      ),
    ]);

    return {
      publicKey: key.publicKey.value,
      intentionsResult: this.toIntentionsResult({
        signedHashes,
        decryptedMessages,
      }),
    };
  }
}
