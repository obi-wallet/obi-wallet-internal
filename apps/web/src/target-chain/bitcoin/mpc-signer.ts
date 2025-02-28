import { HomeChain } from "@/home-chain";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { MpcSigner } from "@/target-chain/mpc-signer";
import { IntentionsResults } from "@/user-interactions/approve-intentions/utils";
import { Encoding } from "@obi-wallet/encoding";
import { MpcWallet } from "@obi-wallet/sdk";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import * as bitcoinjs from "bitcoinjs-lib";
import * as bitcoinMessage from "bitcoinjs-message";
import * as secp256k1 from "secp256k1";

import { BitcoinTargetChain } from ".";
import { BitcoinChainId } from "./chains";

export class BitcoinMpcSigner {
  public readonly mpcSigner: MpcSigner;
  protected readonly publicKey: Secp256k1PublicKey;

  public get address(): string {
    return this.targetChain.computeAddress(this.publicKey);
  }

  constructor(
    protected wallet: MpcWallet,
    protected targetChain: BitcoinTargetChain,
    publicKey: Secp256k1PublicKey,
  ) {
    this.mpcSigner = new MpcSigner(wallet);
    this.publicKey = publicKey;
  }

  public static async fromWallet(
    wallet: MpcWallet,
    targetChainId: BitcoinChainId,
  ): Promise<BitcoinMpcSigner> {
    const targetChain = BitcoinTargetChain.create(targetChainId);
    const publicKeys = await HomeChain.chainId(wallet.homeChainId).publicKeys(
      wallet.userEntryAddress,
    );

    if (!publicKeys.secp256k1) {
      throw new Error("Secp256k1 public key required for Bitcoin");
    }

    return new BitcoinMpcSigner(wallet, targetChain, publicKeys.secp256k1);
  }

  public async getAddress(): Promise<string> {
    return this.address;
  }

  public async signTransaction(psbtBase64: string): Promise<string> {
    const psbt = bitcoinjs.Psbt.fromBase64(psbtBase64, {
      network: this.targetChain.getBitcoinNetwork(),
    });

    // Extract the transaction for hash computation
    const tx = psbt.extractTransaction();

    for (let i = 0; i < psbt.inputCount; i++) {
      const input = psbt.data.inputs[i];
      const txInput = tx.ins[i];

      if (!input || !txInput) {
        throw new Error(`Missing input data at index ${i}`);
      }

      let prevOutScript: Buffer;

      if (input.witnessUtxo) {
        prevOutScript = Buffer.from(input.witnessUtxo.script);
      } else if (input.nonWitnessUtxo) {
        const nonWitnessTx = bitcoinjs.Transaction.fromBuffer(
          input.nonWitnessUtxo,
        );
        const prevOut = nonWitnessTx.outs[txInput.index];
        if (!prevOut) {
          throw new Error(
            `Failed to retrieve previous output at index ${txInput.index}`,
          );
        }
        prevOutScript = Buffer.from(prevOut.script);
      } else {
        throw new Error(`Cannot find UTXO information for input at index ${i}`);
      }

      // Compute the sighash
      const hashToSign = tx.hashForSignature(
        i,
        prevOutScript,
        bitcoinjs.Transaction.SIGHASH_ALL,
      );

      // Sign the hash using MPC Signer
      const signature = await this.signHash(Buffer.from(hashToSign));

      // Append the SIGHASH_ALL flag
      const signatureWithHashType = Buffer.concat([
        signature,
        Buffer.from([bitcoinjs.Transaction.SIGHASH_ALL]),
      ]);

      // Determine if the input is SegWit or not
      const isSegWit = !!input.witnessUtxo;

      if (isSegWit) {
        // For SegWit inputs, set the witness
        psbt.updateInput(i, {
          finalScriptWitness: bitcoinjs.script.compile([
            signatureWithHashType,
            this.getCompressedPublicKey(),
          ]),
        });
      } else {
        // For non-SegWit inputs, set the scriptSig
        psbt.updateInput(i, {
          finalScriptSig: bitcoinjs.script.compile([
            signatureWithHashType,
            this.getCompressedPublicKey(),
          ]),
        });
      }
    }

    psbt.finalizeAllInputs();

    const signedTx = psbt.extractTransaction();
    return signedTx.toHex();
  }

  protected async signHash(hash: Buffer): Promise<Buffer> {
    const signature = await this.mpcSigner.signHash(hash);

    const r = Buffer.from(signature.r.padStart(64, "0"), "hex");
    const s = Buffer.from(signature.s.padStart(64, "0"), "hex");

    const recid = signature.recid;

    // Assemble the compact signature (64 bytes R and S with 1-byte recovery parameter)
    const compactSignature = Buffer.concat([r, s, Buffer.from([recid])]);

    return compactSignature;
  }

  /**
   * Verifies a signed message.
   * @param message - The original message.
   * @param signatureBase64 - The base64-encoded signature.
   * @returns True if the signature is valid, false otherwise.
   */
  public verifyMessage(message: string, signatureBase64: string): boolean {
    const address = this.address;
    try {
      const signature = Buffer.from(signatureBase64, "base64");
      return bitcoinMessage.verify(message, address, signature);
    } catch {
      return false;
    }
  }

  private assembleDERSignature(r: Buffer, s: Buffer): Buffer {
    // Basic DER encoding
    const rTrimmed = this.trimBuffer(r);
    const sTrimmed = this.trimBuffer(s);

    if (!rTrimmed || !sTrimmed || !rTrimmed[0] || !sTrimmed[0]) {
      throw new Error("Invalid signature components");
    }

    const rPrefix = rTrimmed[0] & 0x80 ? Buffer.from([0x00]) : Buffer.alloc(0);
    const sPrefix = sTrimmed[0] & 0x80 ? Buffer.from([0x00]) : Buffer.alloc(0);

    const derEncoded = Buffer.concat([
      Buffer.from([0x30]),
      Buffer.from([
        rPrefix.length + rTrimmed.length + sPrefix.length + sTrimmed.length + 4,
      ]),
      Buffer.from([0x02]),
      Buffer.from([rPrefix.length + rTrimmed.length]),
      rPrefix,
      rTrimmed,
      Buffer.from([0x02]),
      Buffer.from([sPrefix.length + sTrimmed.length]),
      sPrefix,
      sTrimmed,
    ]);

    return derEncoded;
  }

  private trimBuffer(buffer: Buffer): Buffer {
    let start = 0;
    while (start < buffer.length - 1 && buffer[start] === 0x00) {
      start++;
    }
    return buffer.slice(start);
  }

  private getCompressedPublicKey(): Buffer {
    // Decode the Base64 public key to bytes
    const publicKeyBytes = Encoding.fromBase64(this.publicKey.value).toBytes();
    const publicKeyBuffer = Buffer.from(publicKeyBytes);

    if (publicKeyBuffer.length === 33) {
      return publicKeyBuffer;
    } else if (publicKeyBuffer.length === 65) {
      const compressedPublicKey = secp256k1.publicKeyConvert(
        publicKeyBuffer,
        true,
      );
      return Buffer.from(compressedPublicKey);
    } else {
      throw new Error("Invalid public key length");
    }
  }

  /**
   * Adds the results of the MPC intentions to the signer.
   * @param params - The intentions payload and results.
   */
  public addIntentionsResults(params: {
    payload: IntentionsPayload;
    results: IntentionsResults;
  }): void {
    void this.mpcSigner.addIntentionsResults(params);
  }

  public async signMessage(message: string): Promise<string> {
    const messageHash = bitcoinMessage.magicHash(message);

    const signature = await this.signHash(messageHash);

    const signatureBase64 = signature.toString("base64");

    return signatureBase64;
  }
}
