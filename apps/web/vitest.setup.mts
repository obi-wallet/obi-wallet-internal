import { createRootStore } from "@/stores";
import { obiModalConfig } from "@obi-wallet/config";
import fs from "node:fs/promises";
import { vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("lottie-web", () => {
  return {
    default: {
      loadAnimation: () => {
        return {
          destroy: vi.fn(),
          play: vi.fn(),
          pause: vi.fn(),
          stop: vi.fn(),
        };
      },
    },
  };
});

vi.mock("lottie-react", () => {
  return {
    __esModule: true,
    default: vi.fn(() => {
      return null;
    }),
  };
});

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

// Mock createElementNS for SVG elements
const originalCreateElement = document.createElement.bind(document);
const originalCreateElementNS = document.createElementNS.bind(document);

// @ts-expect-error - Mocking DOM API
document.createElementNS = function (
  namespaceURI: string,
  qualifiedName: string,
): Element {
  if (namespaceURI === "http://www.w3.org/2000/svg") {
    const element = originalCreateElement(qualifiedName);
    Object.defineProperties(element, {
      ownerSVGElement: { value: null },
      viewportElement: { value: null },
    });
    return element;
  }
  return originalCreateElementNS(namespaceURI, qualifiedName);
};

// Add any other global test setup here
