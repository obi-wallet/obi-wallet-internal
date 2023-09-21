import { makeObservable } from "mobx";

export class UnityStore {
  private static instance?: UnityStore;

  private _deviceId: string | undefined;

  constructor() {
    if (UnityStore.instance) {
      return UnityStore.instance;
    }
    makeObservable<UnityStore, "getDeviceId" | "setDeviceId">(this, {
      getDeviceId: true,
      setDeviceId: true,
    });
    UnityStore.instance = this;
    this._deviceId = undefined;
  }

  public get getDeviceId() {
    return this._deviceId;
  }

  public setDeviceId(deviceId: string) {
    this._deviceId = deviceId;
  }
}
