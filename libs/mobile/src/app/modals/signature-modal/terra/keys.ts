import { Chain, KeyType, MultisigKey, TerraChain } from "@obi-wallet/common";
import { QueryClient } from "@tanstack/react-query";
import { Key, RawKey, SimplePublicKey } from "@terra-money/terra.js";
import { SHA256, Word32Array } from "jscrypto";
import invariant from "tiny-invariant";

import { createBiometricsSignature } from "../../../biometrics";
import { createNFCSignature } from "../../../nfc";
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
  protected readonly chainId: Chain;
  protected readonly queryClient: QueryClient;

  constructor({
    multisigKey,
    queryClient,
  }: {
    multisigKey: MultisigKey;
    queryClient: QueryClient;
  }) {
    const biometrics = multisigKey.getUsableKeyOfType(KeyType.Device);
    invariant(biometrics, "Expected device key to exist.");
    super(SimplePublicKey.fromAmino(biometrics.payload.publicKey));
    this.deviceKeyPublicKey = biometrics.payload.publicKey.value;
    this.chainId = multisigKey.chain;
    this.queryClient = queryClient;
  }

  async sign(payload: Buffer): Promise<Buffer> {
    const { signature } = await createBiometricsSignature({
      payload: createHash(payload),
      publicKey: this.deviceKeyPublicKey,
      chainId: this.chainId,
      queryClient: this.queryClient,
    });
    return Buffer.from(signature);
  }
}

export class CloudKey extends RawKey {
  constructor({ multisigKey }: { multisigKey: MultisigKey }) {
    const cloudKey = multisigKey.getUsableKeyOfType(KeyType.Cloud);
    invariant(cloudKey, "Expected cloud key to exist.");
    super(Buffer.from(cloudKey.payload.privateKey, "base64"));
  }
}

export class PhoneNumberConfirmKey extends Key {
  protected readonly key: string;
  protected readonly demoMode: boolean;
  protected readonly chainId: Chain;
  protected readonly queryClient: QueryClient;

  constructor({
    key,
    multisigKey,
    demoMode,
    queryClient,
  }: {
    key: string;
    multisigKey: MultisigKey;
    demoMode: boolean;
    queryClient: QueryClient;
  }) {
    const phoneNumberKey = multisigKey.getUsableKeyOfType(KeyType.Phone);
    invariant(phoneNumberKey, "Expected phone number key to exist.");
    super(SimplePublicKey.fromAmino(phoneNumberKey.payload.publicKey));
    this.key = key;
    this.demoMode = demoMode;
    this.chainId = multisigKey.chain;
    this.queryClient = queryClient;
  }

  async sign(): Promise<Buffer> {
    const response = await parseSignatureTextMessageResponse({
      key: this.key,
      demoMode: this.demoMode,
      chainId: this.chainId,
      queryClient: this.queryClient,
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
    const phoneNumberKey = multisigKey.getUsableKeyOfType(KeyType.Phone);
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

export class NfcKey extends Key {
  protected readonly localEntropy: string;

  protected readonly parsed: string;

  protected readonly demoMode: boolean;
  protected readonly chainId: Chain;
  protected readonly queryClient: QueryClient;

  constructor({
    multisigKey,
    parsed,
    demoMode,
    queryClient,
  }: {
    multisigKey: MultisigKey;
    parsed: string;
    demoMode: boolean;
    queryClient: QueryClient;
  }) {
    const nfcKey = multisigKey.getUsableKeyOfType(KeyType.Nfc);
    invariant(nfcKey, "Expected NFC key to exist.");
    super(SimplePublicKey.fromAmino(nfcKey.payload.publicKey));
    this.localEntropy = nfcKey.payload.localEntropy;
    this.parsed = parsed;
    this.demoMode = demoMode;
    this.chainId = multisigKey.chain;
    this.queryClient = queryClient;
  }

  async sign(payload: Buffer): Promise<Buffer> {
    const { signature } = await createNFCSignature({
      payload: createHash(payload),
      demoMode: this.demoMode,
      parsed: this.parsed,
      boostEntropy: true,
      localEntropy: this.localEntropy,
      chainId: this.chainId,
      queryClient: this.queryClient,
    });

    return Buffer.from(signature);
  }
}
