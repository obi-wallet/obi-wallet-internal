import { KeyType, MultisigKey, TerraChain } from "@obi-wallet/common";
import { Key, SimplePublicKey } from "@terra-money/terra.js";
import { SHA256, Word32Array } from "jscrypto";
import secp256k1 from "secp256k1";
import invariant from "tiny-invariant";

import { createBiometricsSignature } from "../../../biometrics";
import {
  parseSignatureTextMessageResponse,
  sendSignatureTextMessage,
} from "../../../text-message";

function createHash(payload: Buffer): Uint8Array {
  const hash = Buffer.from(
    SHA256.hash(new Word32Array(payload)).toString(),
    "hex"
  );
  return Uint8Array.from(hash);
}

export class BiometricsKey extends Key {
  protected readonly deviceKeyPublicKey: string;

  constructor({ multisigKey }: { multisigKey: MultisigKey }) {
    const biometrics = multisigKey.getKeyOfType(KeyType.Device);
    invariant(biometrics, "Expected device key to exist.");
    super(SimplePublicKey.fromAmino(biometrics.payload.publicKey));
    this.deviceKeyPublicKey = biometrics.payload.publicKey.value;
  }

  async sign(payload: Buffer): Promise<Buffer> {
    const { signature } = await createBiometricsSignature({
      payload: createHash(payload),
      publicKey: this.deviceKeyPublicKey,
    });
    return Buffer.from(signature);
  }
}

export class PhoneNumberConfirmKey extends Key {
  protected readonly key: string;
  protected readonly demoMode: boolean;

  constructor({
    key,
    multisigKey,
    demoMode,
  }: {
    key: string;
    multisigKey: MultisigKey;
    demoMode: boolean;
  }) {
    const phoneNumberKey = multisigKey.getKeyOfType(KeyType.Phone);
    invariant(phoneNumberKey, "Expected phone number key to exist.");
    super(SimplePublicKey.fromAmino(phoneNumberKey.payload.publicKey));
    this.key = key;
    this.demoMode = demoMode;
  }

  async sign(): Promise<Buffer> {
    const response = await parseSignatureTextMessageResponse({
      key: this.key,
      demoMode: this.demoMode,
    });
    if (!response) throw new Error("Signing failed");
    return Buffer.from(response);
  }
}

export class PhoneNumberRequestKey extends Key {
  protected readonly phoneNumber: string;
  protected readonly securityAnswer: string;
  protected readonly chainId: TerraChain;
  protected readonly demoMode: boolean;

  constructor({
    securityAnswer,
    chainId,
    multisigKey,
    demoMode,
  }: {
    securityAnswer: string;
    chainId: TerraChain;
    multisigKey: MultisigKey;
    demoMode: boolean;
  }) {
    const phoneNumberKey = multisigKey.getKeyOfType(KeyType.Phone);
    invariant(phoneNumberKey, "Expected phone number key to exist.");
    super(SimplePublicKey.fromAmino(phoneNumberKey.payload.publicKey));
    this.phoneNumber = phoneNumberKey.payload.phoneNumber;
    this.securityAnswer = securityAnswer;
    this.chainId = chainId;
    this.demoMode = demoMode;
  }

  async sign(payload: Buffer): Promise<Buffer> {
    const demoMode = this.demoMode;
    await sendSignatureTextMessage({
      phoneNumber: this.phoneNumber,
      securityAnswer: this.securityAnswer,
      message: createHash(payload),
      demoMode,
      chainId: this.chainId,
    });
    return new Buffer("");
  }
}

export class EmailKey extends Key {
  protected readonly recoveryKey: string;

  constructor({ multisigKey, recoveryKey }: {
    multisigKey: MultisigKey,
    recoveryKey: string,
  }) {
    const email = multisigKey.getKeyOfType(KeyType.Device);
    invariant(email, "Expected device key to exist.");
    super(SimplePublicKey.fromAmino(email.payload.publicKey));
    this.recoveryKey = recoveryKey;
  }

  async sign(payload: Buffer): Promise<Buffer> {
    const privateKeyUint8Array = new Uint8Array(
      Buffer.from(this.recoveryKey, "base64")
    );
    const { signature } = secp256k1.ecdsaSign(payload, privateKeyUint8Array);
    return Buffer.from(signature);
  }
}
