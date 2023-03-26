import {
  AsyncKeySigner,
  Chain,
  KeySubclassTypeMapping,
  KeyType,
  MultisigKey,
  PhoneKeySigner as AbstractPhoneKeySigner,
  Secp256k1PrivateKeySigner,
  Signer,
  TwilioClientInterface,
} from "@obi-wallet/sdk";
import { RefObject } from "react";
import NfcManager, { NfcEvents, OnDiscoverTag } from "react-native-nfc-manager";
import invariant from "tiny-invariant";

import { existsKeyOnDevice, getBiometricsPrivateKey } from "../../biometrics";
import { getNFCPrivateKey, parseNFCData, startReading } from "../../nfc";
import { BottomSheetRef } from "../../screens/components/bottom-sheet";
import { getTwilioClient } from "../../text-message";

export async function createUsableSigners({
  multisigKey,
  demoMode,
  bottomSheetRef,
}: {
  multisigKey: MultisigKey;
  demoMode: boolean;
  bottomSheetRef: RefObject<BottomSheetRef>;
}) {
  const possibleUsableKeys = [
    KeyType.Device,
    KeyType.Phone,
    KeyType.Nfc,
    KeyType.Cloud,
  ];
  return (
    await Promise.all(
      possibleUsableKeys.map(async (type) => {
        const key = multisigKey.getUsableKeyOfType(type);
        if (!key) return null;
        const signer = await createUsableSigner({
          multisigKey,
          demoMode,
          bottomSheetRef,
          key,
        });
        return {
          key,
          signer,
        };
      })
    )
  ).filter(
    (
      result
    ): result is { key: KeySubclassTypeMapping[KeyType]; signer: Signer } => {
      return !!result?.signer;
    }
  );
}

async function createUsableSigner({
  multisigKey,
  demoMode,
  bottomSheetRef,
  key,
}: {
  multisigKey: MultisigKey;
  demoMode: boolean;
  key: KeySubclassTypeMapping[KeyType];
  bottomSheetRef: RefObject<BottomSheetRef>;
}): Promise<Signer | null> {
  switch (key.type) {
    case KeyType.Device: {
      if (
        !(await existsKeyOnDevice({
          publicKey: key.publicKey.value,
        }))
      ) {
        return null;
      }
      return new DeviceKeySigner(key);
    }
    case KeyType.Phone:
      return new PhoneKeySigner({
        key: key,
        chainId: multisigKey.chain,
        demoMode,
        bottomSheetRef,
      });
    case KeyType.Nfc:
      return new NfcKeySigner({
        key,
        demoMode,
      });
    case KeyType.Cloud:
      return new Secp256k1PrivateKeySigner(key.payload.privateKey);
    default:
      return null;
  }
}

export class DeviceKeySigner extends Signer {
  public constructor(protected key: KeySubclassTypeMapping[KeyType.Device]) {
    super();
  }

  public get publicKey() {
    return this.key.publicKey;
  }

  public async signHash(hash: Uint8Array) {
    const privateKey = await getBiometricsPrivateKey({
      publicKey: this.key.publicKey.value,
    });
    return new Secp256k1PrivateKeySigner(privateKey).signHash(hash);
  }
}

export class PhoneKeySigner extends Signer {
  protected signer: AbstractPhoneKeySigner;
  protected twilioClient: TwilioClientInterface;
  protected bottomSheetRef: RefObject<BottomSheetRef>;
  protected chainId: Chain;

  public constructor({
    key,
    chainId,
    demoMode,
    bottomSheetRef,
  }: {
    key: KeySubclassTypeMapping[KeyType.Phone];
    chainId: Chain;
    demoMode: boolean;
    bottomSheetRef: RefObject<BottomSheetRef>;
  }) {
    super();
    this.signer = new AbstractPhoneKeySigner(key);
    this.twilioClient = getTwilioClient(demoMode);
    this.bottomSheetRef = bottomSheetRef;
    this.chainId = chainId;
  }

  public async signHash(hash: Uint8Array) {
    this.bottomSheetRef.current?.snapToIndex(0);
    return await this.signer.signHash(hash);
  }

  public get publicKey() {
    return this.signer.publicKey;
  }

  public async requestSignature(securityAnswer: string) {
    this.bottomSheetRef.current?.snapToIndex(0);
    await this.signer.requestSignature({
      chainId: this.chainId,
      securityAnswer,
      twilioClient: this.twilioClient,
    });
  }

  public async confirmSignature(key: string) {
    await this.signer.confirmSignature({
      chainId: this.chainId,
      key,
      twilioClient: this.twilioClient,
    });
    this.bottomSheetRef.current?.close();
  }

  public cancelSignature() {
    this.signer.cancelSignature();
  }
}

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

export async function createDeviceKeySigner({
  multisigKey,
}: {
  multisigKey: MultisigKey;
}) {
  const deviceKey = multisigKey.getUsableKeyOfType(KeyType.Device);
  invariant(deviceKey, "Expected device key to exist.");
  return new DeviceKeySigner(deviceKey);
}
