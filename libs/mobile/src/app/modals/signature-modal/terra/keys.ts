import {
  isMultisigDemoWallet,
  TerraChain,
  TerraMultisig,
  TerraMultisigWallet,
} from "@obi-wallet/common";
import { Key, SimplePublicKey } from "@terra-money/terra.js";
import { SHA256, Word32Array } from "jscrypto";
import invariant from "tiny-invariant";

import { createBiometricSignature } from "../../../biometrics";
import {
  checkIsSupported,
  createNFCSignature,
  startReading,
} from "../../../nfc";
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
  protected readonly wallet: TerraMultisigWallet;

  constructor({
    wallet,
    multisig,
  }: {
    wallet: TerraMultisigWallet;
    multisig: TerraMultisig;
  }) {
    const biometrics = multisig.biometrics;
    invariant(biometrics, "Expected device key to exist.");
    super(SimplePublicKey.fromAmino(biometrics.publicKey));
    this.wallet = wallet;
  }

  async sign(payload: Buffer): Promise<Buffer> {
    const demoMode = isMultisigDemoWallet(this.wallet);
    const { signature } = await createBiometricSignature({
      payload: createHash(payload),
      demoMode,
    });
    return Buffer.from(signature);
  }
}

export class PhoneNumberConfirmKey extends Key {
  protected readonly key: string;
  protected readonly wallet: TerraMultisigWallet;

  constructor({
    key,
    wallet,
    multisig,
  }: {
    key: string;
    wallet: TerraMultisigWallet;
    multisig: TerraMultisig;
  }) {
    const phoneNumberKey = multisig.phoneNumber;
    invariant(phoneNumberKey, "Expected phone number key to exist.");
    super(SimplePublicKey.fromAmino(phoneNumberKey.publicKey));
    this.key = key;
    this.wallet = wallet;
  }

  async sign(payload: Buffer): Promise<Buffer> {
    const demoMode = isMultisigDemoWallet(this.wallet);
    const response = await parseSignatureTextMessageResponse({
      key: this.key,
      demoMode,
    });
    if (!response) throw new Error("Signing failed");
    return Buffer.from(response);
  }
}

export class PhoneNumberRequestKey extends Key {
  protected readonly phoneNumber: string;
  protected readonly securityAnswer: string;
  protected readonly chainId: TerraChain;

  protected readonly wallet: TerraMultisigWallet;

  constructor({
    phoneNumber,
    securityAnswer,
    chainId,
    wallet,
    multisig,
  }: {
    phoneNumber: string;
    securityAnswer: string;
    chainId: TerraChain;
    wallet: TerraMultisigWallet;
    multisig: TerraMultisig;
  }) {
    const phoneNumberKey = multisig.phoneNumber;
    invariant(phoneNumberKey, "Expected phone number key to exist.");
    super(SimplePublicKey.fromAmino(phoneNumberKey.publicKey));
    this.phoneNumber = phoneNumber;
    this.securityAnswer = securityAnswer;
    this.chainId = chainId;
    this.wallet = wallet;
  }

  async sign(payload: Buffer): Promise<Buffer> {
    const demoMode = isMultisigDemoWallet(this.wallet);
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

export class NFCKey extends Key {
  protected readonly wallet: TerraMultisigWallet;
  protected boostEntropy: boolean;
  protected localEntropy: Buffer;
  protected parsed: string;

  constructor({
    wallet,
    multisig,
    boostEntropy,
    parsed,
  }: {
    wallet: TerraMultisigWallet;
    multisig: TerraMultisig;
    boostEntropy: boolean;
    parsed: string[];
  }) {
    const nfc = multisig.nfc;
    invariant(nfc, "Expected NFC key to exist.");
    super(SimplePublicKey.fromAmino(nfc.publicKey));
    this.wallet = wallet;
    this.boostEntropy = boostEntropy;
    this.localEntropy = this.wallet.nextAdmin?.localEntropy;
    this.parsed = JSON.stringify(parsed);
  }

  async sign(payload: Buffer): Promise<Buffer> {
    const demoMode = isMultisigDemoWallet(this.wallet);
    const { signature } = await createNFCSignature({
      payload: createHash(payload),
      demoMode,
      parsed: this.parsed,
      boostEntropy: this.boostEntropy,
      localEntropy: this.localEntropy,
    });
    return Buffer.from(signature);
  }
}
