import { Secp256k1KeyPair } from "@obi-wallet/sdk";
import { action, makeObservable } from "mobx";

export class PhoneSessionStore {
  protected kp: Secp256k1KeyPair | null;

  constructor({ kp }: { kp: Secp256k1KeyPair | null }) {
    this.kp = kp;
    makeObservable<PhoneSessionStore, "kp" | "getKp" | "setKp">(this, {
      kp: false,
      getKp: false,
      setKp: action,
    });
  }

  public setKp(kp: Secp256k1KeyPair) {
    this.kp = kp;
  }

  public get getKp() {
    return this.kp;
  }
}
