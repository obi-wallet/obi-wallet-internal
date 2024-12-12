// Mock for ecies-wasm
export async function init() {
  return await Promise.resolve();
}

export function encrypt() {
  return Buffer.alloc(32);
}

export function decrypt() {
  return Buffer.alloc(32);
}
