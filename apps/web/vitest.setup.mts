import { createRootStore } from "@/stores";
import { obiModalConfig } from "@obi-wallet/config";
import fs from "node:fs/promises";
import { vi } from "vitest";

vi.stubGlobal(
  "Worker",
  class MockWorker {
    public postMessage() {}
  },
);

async function getEciesWasm() {
  const ecies = await import("ecies-wasm/ecies_wasm");
  // @ts-expect-error URL import
  const wasmURL = await import("ecies-wasm/ecies_wasm_bg.wasm?url");
  const wasmSource = await fs.readFile(wasmURL.default.replace("/@fs", ""));
  const wasmModule = await WebAssembly.compile(wasmSource);
  await ecies.default(wasmModule);
  return ecies;
}

async function getMpcEcdsaWasm() {
  const wasmPackage = await import("@obi-wallet/mpc-ecdsa-wasm");
  // @ts-expect-error URL import
  const wasmURL = await import("@obi-wallet/mpc-ecdsa-wasm?url");
  const wasmSource = await fs.readFile(
    wasmURL.default
      .replace("/@fs", "")
      .replace("mpc_bindings.js", "mpc_bindings_bg.wasm"),
  );
  await wasmPackage.default(wasmSource);
  return wasmPackage;
}

const eciesWasm = await getEciesWasm();
const mpcEcdsaWasm = await getMpcEcdsaWasm();

const rootStore = createRootStore({
  config: obiModalConfig,
});
rootStore.wasmStore.getEciesWasm = async () => {
  return eciesWasm;
};
rootStore.wasmStore.getMpcEcdsaWasm = async () => {
  return mpcEcdsaWasm;
};
