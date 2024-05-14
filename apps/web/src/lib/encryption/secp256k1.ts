import { rootStore } from "@/hooks/use-create-root-store";
import { Base64EncodedString, Encoding } from "@obi-wallet/encoding";
import {
  Sec256k1PrivateKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import invariant from "tiny-invariant";

export class Secp256k1Encryption {
  public constructor(protected readonly publicKey: Secp256k1PublicKey) {}

  public async encrypt(data: string): Promise<Base64EncodedString> {
    const u8Data = Buffer.from(data, "utf8");
    const ecies = await this.getEciesWasm();
    const encrypted = ecies.encrypt(
      Encoding.fromBase64(this.publicKey.value).toBytes(),
      u8Data,
    );
    return Encoding.fromBytes(encrypted).toBase64();
  }

  protected async getEciesWasm() {
    const stores = rootStore.current;
    invariant(stores, "RootStore not initialized");
    return await stores.wasmStore.getEciesWasm();
  }
}

export class Secp256k1Decryption {
  public constructor(protected readonly privateKey: Sec256k1PrivateKey) {}

  public async decrypt(data: Base64EncodedString): Promise<string> {
    const u8Data = Encoding.fromBase64(data).toBytes();
    const ecies = await this.getEciesWasm();
    const decrypted = ecies.decrypt(
      Encoding.fromBase64(this.privateKey).toBytes(),
      u8Data,
    );
    return Buffer.from(decrypted).toString("utf8");
  }

  protected async getEciesWasm() {
    const stores = rootStore.current;
    invariant(stores, "RootStore not initialized");
    return await stores.wasmStore.getEciesWasm();
  }
}
