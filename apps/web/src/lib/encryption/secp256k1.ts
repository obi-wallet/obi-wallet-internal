import { rootStore } from "@/hooks/use-create-root-store";
import {
  Sec256k1PrivateKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import invariant from "tiny-invariant";

export class Secp256k1Encryption {
  public constructor(protected readonly publicKey: Secp256k1PublicKey) {}

  public async encrypt(data: string): Promise<string> {
    const u8Data = Buffer.from(data, "utf8");
    const ecies = await this.getEciesWasm();
    const encrypted = ecies.encrypt(
      Buffer.from(this.publicKey.value, "base64"),
      u8Data,
    );
    return Buffer.from(encrypted).toString("base64");
  }

  protected async getEciesWasm() {
    const stores = rootStore.current;
    invariant(stores, "RootStore not initialized");
    return await stores.wasmStore.getEciesWasm();
  }
}

export class Secp256k1Decryption {
  public constructor(protected readonly privateKey: Sec256k1PrivateKey) {}

  public async decrypt(data: string): Promise<string> {
    const u8Data = Buffer.from(data, "base64");
    const ecies = await this.getEciesWasm();
    const decrypted = ecies.decrypt(
      Buffer.from(this.privateKey, "base64"),
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
