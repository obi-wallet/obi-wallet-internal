import invariant from "tiny-invariant";

export async function existsKeyOnDevice(_: {
  publicKey: string;
}): Promise<boolean> {
  invariant(false, "existsKeyOnDevice not implemented for web");
}

export async function resetBiometricsKeyPair(): Promise<void> {
  invariant(false, "resetBiometricsKeyPair not implemented for web");
}

export async function getBiometricsPublicKey(_: {
  demoMode: boolean;
}): Promise<string> {
  invariant(false, "getBiometricsPublicKey not implemented for web");
}

export async function getBiometricsPrivateKey(_: {
  publicKey: string;
}): Promise<string> {
  invariant(false, "getBiometricsPrivateKey not implemented for web");
}

export async function getBiometricsKeyPair(_: {
  demoMode: boolean;
}): Promise<{ publicKey: string; privateKey: string }> {
  invariant(false, "getBiometricsKeyPair not implemented for web");
}
