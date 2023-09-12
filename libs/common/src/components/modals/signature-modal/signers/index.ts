import {
  ChainId,
  KeySubclassTypeMapping,
  KeyType,
  MultisigKey,
  PhoneKeySigner as AbstractPhoneKeySigner,
  Secp256k1PrivateKeySigner,
  Signer,
  TwilioClientInterface,
  ZAuthKeySigner,
  getDevicePrivateKey,
  getOrCreateDeviceKeyPair,
} from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

import { NfcKeySigner } from "./nfc-key-signer";
import { Env } from "../../../../contexts";
import { getTwilioClient } from "../../../../keys";

export async function createUsableSigners({
  multisigKey,
  demoMode,
  env,
}: {
  multisigKey: MultisigKey;
  demoMode: boolean;
  openBottomSheet: () => void;
  env: Env;
}) {
  const possibleUsableKeys = [
    KeyType.Device,
    KeyType.Phone,
    KeyType.Nfc,
    KeyType.Cloud,
    KeyType.EmailRecovery,
  ];
  return (
    await Promise.all(
      possibleUsableKeys.map(async (type) => {
        const key = multisigKey.getUsableKeyOfType(type);
        if (!key) return null;
        const signer = await createUsableSigner({
          multisigKey,
          demoMode,
          key,
          env,
        });
        return {
          key,
          signer,
        };
      }),
    )
  ).filter(
    (
      result,
    ): result is { key: KeySubclassTypeMapping[KeyType]; signer: Signer } => {
      return !!result?.signer;
    },
  );
}

async function createUsableSigner({
  multisigKey,
  demoMode,
  key,
  env,
}: {
  multisigKey: MultisigKey;
  demoMode: boolean;
  key: KeySubclassTypeMapping[KeyType];
  env: Env;
}): Promise<Signer | null> {
  switch (key.type) {
    case KeyType.ZAuth:
      return new ZAuthKeySigner(key);
    case KeyType.Device: {
      if (!(await getDevicePrivateKey(key))) {
        return null;
      }
      return new DeviceKeySigner(key);
    }
    case KeyType.Phone:
      return new PhoneKeySigner({
        key: key,
        chainId: multisigKey.chainId,
        demoMode,
        env,
      });
    case KeyType.Nfc:
      return new NfcKeySigner({
        key,
        demoMode,
      });
    case KeyType.Cloud:
      return new Secp256k1PrivateKeySigner(key.payload.privateKey);
    case KeyType.EmailRecovery:
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
    const isUVPAA =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (isUVPAA) {
      const [kp, _] = await getOrCreateDeviceKeyPair(false, false);
      invariant(kp, "device keypair not obtained");
      return new Secp256k1PrivateKeySigner(kp.privateKey).signHash(hash);
    } else {
      const privateKey = await getDevicePrivateKey(this.key);
      invariant(privateKey, "Expected private key to exist.");
      return new Secp256k1PrivateKeySigner(privateKey).signHash(hash);
    }
  }
}

export class PhoneKeySigner extends Signer {
  protected signer: AbstractPhoneKeySigner;
  protected twilioClient: TwilioClientInterface;
  protected chainId: ChainId;

  public constructor({
    key,
    chainId,
    demoMode,
    env,
  }: {
    key: KeySubclassTypeMapping[KeyType.Phone];
    chainId: ChainId;
    demoMode: boolean;
    env: Env;
  }) {
    super();
    this.signer = new AbstractPhoneKeySigner(key);
    this.twilioClient = getTwilioClient({ demoMode, env });
    this.chainId = chainId;
  }

  public async signHash(hash: Uint8Array) {
    return await this.signer.signHash(hash);
  }

  public get publicKey() {
    return this.signer.publicKey;
  }

  public async requestSignature({
    securityAnswer,
    voice,
  }: {
    securityAnswer: string;
    voice: boolean;
  }) {
    await this.signer.requestSignature({
      chainId: this.chainId,
      securityAnswer,
      twilioClient: this.twilioClient,
      voice,
    });
  }

  public async confirmSignature(key: string) {
    await this.signer.confirmSignature({
      chainId: this.chainId,
      key,
      twilioClient: this.twilioClient,
    });
  }

  public cancelSignature() {
    this.signer.cancelSignature();
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
