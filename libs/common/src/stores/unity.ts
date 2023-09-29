import { makeObservable } from "mobx";

export class UnityStore {
  static #instance?: UnityStore;

  #deviceId: string | undefined;

  constructor() {
    if (UnityStore.#instance) {
      return UnityStore.#instance;
    }
    // lint likes to add _deviceID: true
    // prettier-ignore
    // eslint-disable-next-line mobx/exhaustive-make-observable
    makeObservable<UnityStore, "currentDeviceId" | "deviceId">(this, {
      currentDeviceId: true,
      deviceId: true,
    });
    UnityStore.#instance = this;
    this.#deviceId = undefined;
  }

  public get currentDeviceId(): string | undefined {
    return this.#deviceId;
  }

  public set deviceId(deviceId: string) {
    this.#deviceId = deviceId;
  }
}
