export type MpcEcdsaWasm = typeof import("@obi-wallet/mpc-ecdsa-wasm");

export class WasmStore {
  protected _mpcEcdsaWasm: MpcEcdsaWasm | null = null;

  public async getMpcEcdsaWasm(): Promise<MpcEcdsaWasm> {
    if (this._mpcEcdsaWasm) return this._mpcEcdsaWasm;
    const wasmPackage = await import("@obi-wallet/mpc-ecdsa-wasm");

    const response = await fetch("/mpc_bindings_bg.wasm");
    const bytes = await response.arrayBuffer();
    // @ts-expect-error We defined this
    wasmPackage.initBrowser(bytes);
    this._mpcEcdsaWasm = wasmPackage;
    return wasmPackage;
  }
}
