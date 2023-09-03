import { action, autorun, computed, makeObservable } from "mobx";

export class ZauthStore {
  protected tokens: {
    accessToken: string;
    refreshToken: string;
  } | undefined

  constructor() {
    makeObservable<ZauthStore, "tokens">(
      this,
      {
        tokens: false,
      },
    );

    autorun(() => {
      //
    });
  }

  public get currentTokens() {
    return (
      this.tokens
    );
  }

  public setCurrentTokens(tokens: { accessToken: string; refreshToken: string; }) {
    this.tokens = tokens;
  }
}
