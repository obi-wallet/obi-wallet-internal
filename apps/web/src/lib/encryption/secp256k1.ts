import { rootStore } from "@/stores";
import { Encoding, Utf8EncodedString } from "@obi-wallet/encoding";
import { Secp256k1EncryptedData } from "@obi-wallet/sdk";
import {
  Sec256k1PrivateKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import invariant from "tiny-invariant";

export class Secp256k1Encryption {
  public constructor(protected readonly publicKey: Secp256k1PublicKey) {}

  public async encrypt(data: string): Promise<Secp256k1EncryptedData> {
    const u8Data = Encoding.fromUtf8(data).toBytes();
    const ecies = await this.getEciesWasm();
    const encrypted = ecies.encrypt(
      Encoding.fromBase64(this.publicKey.value).toBytes(),
      u8Data,
    );
    return Secp256k1EncryptedData.parse(
      Encoding.fromBytes(encrypted).toBase64(),
    );
  }

  protected async getEciesWasm() {
    const stores = rootStore.current;
    invariant(stores, "RootStore not initialized");
    return await stores.wasmStore.getEciesWasm();
  }
}

export class Secp256k1Decryption {
  public constructor(protected readonly privateKey: Sec256k1PrivateKey) {}

  public async decrypt(
    data: Secp256k1EncryptedData,
  ): Promise<Utf8EncodedString> {
    const u8Data = Encoding.fromBase64(data).toBytes();
    const ecies = await this.getEciesWasm();
    const decrypted = ecies.decrypt(
      Encoding.fromBase64(this.privateKey).toBytes(),
      u8Data,
    );
    return Encoding.fromBytes(decrypted).toUtf8();
  }

  protected async getEciesWasm() {
    const stores = rootStore.current;
    invariant(stores, "RootStore not initialized");
    return await stores.wasmStore.getEciesWasm();
  }
}
