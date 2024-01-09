import { Draftable } from "@/stores/drafts/draft";
import { ChainId, MultisigKey, ObservableMultisigKey } from "@obi-wallet/sdk";
import { action, makeObservable, observable } from "mobx";

export class OnboardingPayload implements Draftable {
  protected _multisigKey: MultisigKey;
  protected _name: string;
  protected _image: string;
  protected _currentStep: number;

  constructor(chainId: ChainId) {
    this._multisigKey = ObservableMultisigKey.create(undefined, chainId);
    this._name = "";
    this._image = "";
    this._currentStep = 1;
    makeObservable<
      OnboardingPayload,
      "_multisigKey" | "_name" | "_image" | "_currentStep"
    >(this, {
      multisigKey: false,
      name: false,
      image: false,
      currentStep: false,
      _multisigKey: observable,
      _name: observable,
      _image: observable,
      _currentStep: observable,
      clone: false,
      equals: false,
      setName: action,
      setImage: action,
      setCurrentStep: action,
    });
  }

  public get multisigKey() {
    return this._multisigKey;
  }

  public get name() {
    return this._name;
  }

  public setName(name: string) {
    this._name = name;
  }

  public get image() {
    return this._image;
  }

  public setImage(image: string) {
    this._image = image;
  }

  public get currentStep() {
    return this._currentStep;
  }

  public setCurrentStep(step: number) {
    this._currentStep = step;
  }

  public clone() {
    const clone = new OnboardingPayload(this.multisigKey.chainId);
    clone._multisigKey = this.multisigKey.clone();
    clone._name = this.name;
    clone._image = this.image;
    clone._currentStep = this.currentStep;
    return clone as this;
  }

  public equals(other: OnboardingPayload) {
    return (
      this.multisigKey.equals(other.multisigKey) &&
      this.name === other.name &&
      this.image === other.image &&
      this.currentStep === other.currentStep
    );
  }
}
