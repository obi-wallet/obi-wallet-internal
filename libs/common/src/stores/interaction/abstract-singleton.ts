import { InteractionWaitingData } from "@keplr-wallet/background";
import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";
import { autorun, computed, flow, makeObservable, observable } from "mobx";

export class AbstractSingletonInteractionStore<
  MessagePayload,
  MessageResponse
> {
  protected readonly interactionStore: KeplrInteractionStore;
  protected readonly type: string;

  @observable
  protected _isLoading = false;

  constructor({
    interactionStore,
    type,
  }: {
    interactionStore: KeplrInteractionStore;
    type: string;
  }) {
    this.interactionStore = interactionStore;
    this.type = type;

    makeObservable(this);

    autorun(() => {
      // Reject all interactions that is not first one.
      // This interaction can have only one interaction at once.
      const datas = this.waitingDatas.slice();
      if (datas.length > 1) {
        for (let i = 1; i < datas.length; i++) {
          this.rejectWithId(datas[i].id);
        }
      }
    });
  }

  protected get waitingDatas() {
    return this.interactionStore.getDatas<MessagePayload>(this.type);
  }

  @computed
  get waitingData(): InteractionWaitingData<MessagePayload> | undefined {
    const datas = this.waitingDatas;

    if (datas.length === 0) {
      return undefined;
    }

    return datas[0];
  }

  @flow
  *approveAndWaitEnd(response: MessageResponse) {
    if (this.waitingDatas.length === 0) {
      return;
    }

    this._isLoading = true;
    const id = this.waitingDatas[0].id;
    try {
      yield this.interactionStore.approveWithoutRemovingData(id, response);
    } finally {
      this.interactionStore.removeData(this.type, id);
      this._isLoading = false;
    }
  }

  @flow
  *reject() {
    if (this.waitingDatas.length === 0) {
      return;
    }

    this._isLoading = true;
    try {
      yield this.interactionStore.reject(this.type, this.waitingDatas[0].id);
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *rejectAll() {
    this._isLoading = true;
    try {
      yield this.interactionStore.rejectAll(this.type);
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  protected *rejectWithId(id: string) {
    yield this.interactionStore.reject(this.type, id);
  }
}
