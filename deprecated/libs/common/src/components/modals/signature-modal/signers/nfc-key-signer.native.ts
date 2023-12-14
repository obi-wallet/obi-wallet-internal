import {
  AsyncKeySigner,
  KeySubclassTypeMapping,
  KeyType,
  Secp256k1PrivateKeySigner,
} from "@obi-wallet/sdk";
import NfcManager, { NfcEvents, OnDiscoverTag } from "react-native-nfc-manager";

import { getNFCPrivateKey, parseNFCData, startReading } from "../../../../keys";

export class NfcKeySigner extends AsyncKeySigner<KeyType.Nfc> {
  protected demoMode: boolean;

  public constructor({
    key,
    demoMode,
  }: {
    key: KeySubclassTypeMapping[KeyType.Nfc];
    demoMode: boolean;
  }) {
    super(key);
    this.demoMode = demoMode;
  }

  public async signHash(hash: Uint8Array) {
    const onDiscoverTag: OnDiscoverTag = async (tag) => {
      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        const parsed = parseNFCData(tag);

        const privateKey = await getNFCPrivateKey({
          demoMode: this.demoMode,
          parsed,
          boostEntropy: true,
          localEntropy: this.key.payload.localEntropy,
        });
        const signer = new Secp256k1PrivateKeySigner(privateKey);
        this.finishSignature(await signer.signHash(hash));
      }
    };
    NfcManager.setEventListener(NfcEvents.DiscoverTag, onDiscoverTag);
    void startReading("Tap your NFC device to sign this transaction.");
    return await super.signHash(hash);
  }
}
