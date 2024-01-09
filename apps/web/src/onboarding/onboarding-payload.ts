import { Draftable } from "@/stores/drafts/draft";
import { ChainId, MultisigKey, ObservableMultisigKey } from "@obi-wallet/sdk";
import { action, makeObservable, observable } from "mobx";
import { equals } from "ramda";

export class OnboardingPayload implements Draftable {
  public multisigKey: MultisigKey;
  public userData: {
    name: string;
    image: string;
  } | null;
  public currentStep: number;

  constructor(chainId: ChainId) {
    this.multisigKey = ObservableMultisigKey.create(undefined, chainId);
    this.userData = null;
    this.currentStep = 1;
    makeObservable(this, {
      multisigKey: observable,
      userData: observable,
      currentStep: observable,
      clone: false,
      equals: false,
      setUserData: action,
      setCurrentStep: action,
    });
  }

  public setUserData(userData: { name: string; image: string }) {
    this.userData = userData;
  }

  public setCurrentStep(step: number) {
    this.currentStep = step;
  }

  public clone() {
    const clone = new OnboardingPayload(this.multisigKey.chainId);
    clone.multisigKey = this.multisigKey.clone();
    clone.userData = this.userData ? { ...this.userData } : null;
    clone.currentStep = this.currentStep;
    return clone as this;
  }

  public equals(other: OnboardingPayload) {
    return (
      this.multisigKey.equals(other.multisigKey) &&
      equals(this.userData, other.userData) &&
      this.currentStep === other.currentStep
    );
  }
}
