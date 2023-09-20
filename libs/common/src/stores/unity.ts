import { makeObservable } from "mobx";

export class UnityStore {
  private static instance?: UnityStore;

  protected _deviceId: string | undefined;

  constructor() {
    if (UnityStore.instance) {
      return UnityStore.instance;
    }
    makeObservable<UnityStore, "getDeviceId" | "setDeviceId">(this, { _deviceId: true, 
      getDeviceId: true,
      setDeviceId: true,
    });
    UnityStore.instance = this;
  }

  public get getDeviceId() {
    return this._deviceId;
  }

  public setDeviceId(deviceId: string) {
    this._deviceId = deviceId;
  }
}
