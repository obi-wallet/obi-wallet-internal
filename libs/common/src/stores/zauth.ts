import { makeObservable } from "mobx";

export class ZauthStore {
  private static instance?: ZauthStore;

  protected tokens:
    | {
        accessToken: string;
        refreshToken: string;
      }
    | undefined;

  constructor() {
    if (ZauthStore.instance) {
      return ZauthStore.instance;
    }
    makeObservable<ZauthStore, "tokens">(this, {
      currentTokens: true,
      setCurrentTokens: true,
      tokens: false,
    });
    ZauthStore.instance = this;
  }

  public get currentTokens() {
    return this.tokens;
  }

  public setCurrentTokens(tokens: {
    accessToken: string;
    refreshToken: string;
  }) {
    this.tokens = tokens;
  }
}
