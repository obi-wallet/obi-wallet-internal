export class GoogleApiStore {
  protected gapi: typeof gapi | null = null;

  public async getGapi() {
    if (!this.gapi) {
      const gapiScript = await import("gapi-script");
      this.gapi = gapiScript.gapi;
    }
    return this.gapi;
  }
}
