export type MpcEcdsaWasm = typeof import("@obi-wallet/mpc-ecdsa-wasm");

export class WasmStore {
  protected _mpcEcdsaWasm: MpcEcdsaWasm | null = null;

  public async getMpcEcdsaWasm(): Promise<MpcEcdsaWasm> {
    if (this._mpcEcdsaWasm) return this._mpcEcdsaWasm;
    const wasmPackage = await import("@obi-wallet/mpc-ecdsa-wasm");
    await wasmPackage.default();
    this._mpcEcdsaWasm = wasmPackage;
    return wasmPackage;
  }
}
