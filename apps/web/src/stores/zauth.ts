import { action, observable } from "mobx";

export class ZauthStore {
  private static instance?: ZauthStore;

  @observable protected accessor tokens:
    | {
        accessToken: string;
        refreshToken: string;
      }
    | undefined;

  constructor() {
    if (ZauthStore.instance) {
      return ZauthStore.instance;
    }
    ZauthStore.instance = this;
  }

  public get currentTokens() {
    return this.tokens;
  }

  @action
  public setCurrentTokens(tokens: {
    accessToken: string;
    refreshToken: string;
  }) {
    this.tokens = tokens;
  }
}
