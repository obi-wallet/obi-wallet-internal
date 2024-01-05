import { Draftable } from "@/stores/drafts/draft";
import {
  MultisigKey,
  ObservableMultisigKey,
  SecretJsChainId,
} from "@obi-wallet/sdk";
import { action, makeObservable, observable } from "mobx";

export class OnboardingPayload implements Draftable {
  protected _multisigKey: MultisigKey;
  protected _name: string;
  protected _image: string;

  constructor(chainId: SecretJsChainId) {
    this._multisigKey = ObservableMultisigKey.create(undefined, chainId);
    this._name = "";
    this._image = "";
    makeObservable<OnboardingPayload, "_multisigKey" | "_name" | "_image">(
      this,
      {
        _multisigKey: observable,
        _name: observable,
        _image: observable,
        clone: false,
        equals: false,
        name: false,
        setName: action,
        multisigKey: false,
      },
    );
  }

  public get name() {
    return this._name;
  }

  public setName(name: string) {
    this._name = name;
  }

  public get multisigKey() {
    return this._multisigKey;
  }

  public clone() {
    const clone = new OnboardingPayload(this._multisigKey.chainId);
    clone._multisigKey = this._multisigKey.clone();
    clone._name = this._name;
    clone._image = this._image;
    return clone as this;
  }

  public equals(other: OnboardingPayload) {
    return (
      this._multisigKey.equals(other._multisigKey) &&
      this._name === other._name &&
      this._image === other._image
    );
  }
}
