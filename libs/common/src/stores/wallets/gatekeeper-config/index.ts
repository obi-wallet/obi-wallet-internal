import {
  GatekeeperConfig as GatekeeperConfigSdk,
  Serialized,
} from "@obi-wallet/sdk";
import { action, makeObservable, observable } from "mobx";
import * as R from "ramda";

import { Draftable } from "../../drafts/draft";

export class GatekeeperConfig implements Draftable {
  @observable.ref
  protected _gatekeeperConfig: GatekeeperConfigSdk;

  public get() {
    return this._gatekeeperConfig;
  }

  @action
  public set(gatekeeperConfig: GatekeeperConfigSdk) {
    this._gatekeeperConfig = gatekeeperConfig;
  }

  constructor() {
    this._gatekeeperConfig = GatekeeperConfigSdk.empty();
    makeObservable(this);
  }

  public toJSON() {
    return this._gatekeeperConfig.toJSON();
  }

  public clone() {
    return GatekeeperConfig.deserialize(this.toJSON()) as this;
  }

  public equals(other: GatekeeperConfig) {
    return R.equals(this.toJSON(), other.toJSON());
  }

  public static deserialize(data: Serialized<typeof GatekeeperConfigSdk>) {
    const gatekeeperConfig = new GatekeeperConfig();
    gatekeeperConfig.set(GatekeeperConfigSdk.deserialize(data));
    return gatekeeperConfig;
  }
}
