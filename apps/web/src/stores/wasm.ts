export type MpcEcdsaWasm = typeof import("@obi-wallet/mpc-ecdsa-wasm");
export type EciesWasm = typeof import("ecies-wasm");

export class WasmStore {
  protected _mpcEcdsaWasmPromise: Promise<MpcEcdsaWasm> | null = null;
  protected _eciesWasmPromise: Promise<EciesWasm> | null = null;

  public async getMpcEcdsaWasm(): Promise<MpcEcdsaWasm> {
    if (!this._mpcEcdsaWasmPromise) {
      this._mpcEcdsaWasmPromise = this._getMpcEcdsaWasm();
    }
    return this._mpcEcdsaWasmPromise;
  }

  public async getEciesWasm(): Promise<EciesWasm> {
    if (!this._eciesWasmPromise) {
      this._eciesWasmPromise = this._getEciesWasm();
    }
    return this._eciesWasmPromise;
  }

  protected async _getMpcEcdsaWasm() {
    const wasmPackage = await import("@obi-wallet/mpc-ecdsa-wasm");
    await wasmPackage.default();
    return wasmPackage;
  }

  protected async _getEciesWasm() {
    const wasmPackage = await import("ecies-wasm");
    await wasmPackage.default();
    return wasmPackage;
  }
}
