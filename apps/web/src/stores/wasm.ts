export type MpcEcdsaWasm = typeof import("@obi-wallet/mpc-ecdsa-wasm");
export type EciesWasm = typeof import("ecies-wasm");

export class WasmStore {
  protected _mpcEcdsaWasm: MpcEcdsaWasm | null = null;
  protected _eciesWasm: EciesWasm | null = null;

  public async getMpcEcdsaWasm(): Promise<MpcEcdsaWasm> {
    if (this._mpcEcdsaWasm) return this._mpcEcdsaWasm;
    const wasmPackage = await import("@obi-wallet/mpc-ecdsa-wasm");
    await wasmPackage.default();
    this._mpcEcdsaWasm = wasmPackage;
    return wasmPackage;
  }

  public async getEciesWasm() {
    if (this._eciesWasm) return this._eciesWasm;
    const wasmPackage = await import("ecies-wasm");
    await wasmPackage.default();
    this._eciesWasm = wasmPackage;
    return wasmPackage;
  }
}
