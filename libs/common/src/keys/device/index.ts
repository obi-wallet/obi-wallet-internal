import { KVStore } from "@obi-wallet/headless-ui";
import { generateSec256k1KeyPair } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

// TODO: this is a temporary & insecure mock implementation using localStorage. We want to use WebAuthn in the future.
const BIOMETRICS_KEY = "obi-wallet-biometrics";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

const kvStore = new KVStore("device-keys");

export async function existsKeyOnDevice({ publicKey }: { publicKey: string }) {
  if (publicKey === DEMO_PUBLIC_KEY) return true;

  const isKeyOnDevice = await kvStore.get<boolean>(publicKey);

  if (typeof isKeyOnDevice === "boolean") return isKeyOnDevice;

  try {
    await getBiometricsPrivateKey({ publicKey });
    await kvStore.set(publicKey, true);
    return true;
  } catch (e) {
    await kvStore.set(publicKey, false);
    return false;
  }
}

export async function resetBiometricsKeyPair() {
  localStorage.removeItem(BIOMETRICS_KEY);
}

export async function getBiometricsPublicKey({
  demoMode,
}: {
  demoMode: boolean;
}) {
  const { publicKey } = await getBiometricsKeyPair({ demoMode });
  return publicKey;
}

export async function getBiometricsPrivateKey({
  publicKey,
}: {
  publicKey: string;
}) {
  if (publicKey === DEMO_PUBLIC_KEY) return DEMO_PRIVATE_KEY;

  const credentials = fetchCredentialsFromLocalStorage({
    service: `${BIOMETRICS_KEY}/${publicKey}`,
  });

  if (credentials) return credentials.password;

  const fallbackCredentials = fetchCredentialsFromLocalStorage({
    service: BIOMETRICS_KEY,
  });

  if (fallbackCredentials && fallbackCredentials.username === publicKey) {
    saveCredentialsToLocalStorage({
      service: `${BIOMETRICS_KEY}/${publicKey}`,
      username: publicKey,
      password: fallbackCredentials.password,
    });
    return fallbackCredentials.password;
  }

  invariant(false, "Key not found on device.");
}

export async function getBiometricsKeyPair(_: { demoMode: boolean }) {
  // TODO: remove this once we have Osmosis-specific fix for prepareKeyPair
  // eslint-disable-next-line no-constant-condition
  return {
    privateKey: DEMO_PRIVATE_KEY,
    publicKey: DEMO_PUBLIC_KEY,
  };

  // const credentials = await fetchCredentialsFromLocalStorage({
  //   service: BIOMETRICS_KEY,
  // });
  //
  // if (credentials) {
  //   return {
  //     publicKey: credentials.username,
  //     privateKey: credentials.password,
  //   };
  // } else {
  //   const { publicKey, privateKey } = generateSec256k1KeyPair();
  //
  //   saveCredentialsToLocalStorage({
  //     service: BIOMETRICS_KEY,
  //     username: publicKey.value,
  //     password: privateKey,
  //   });
  //   saveCredentialsToLocalStorage({
  //     service: `${BIOMETRICS_KEY}/${publicKey}`,
  //     username: publicKey.value,
  //     password: privateKey,
  //   });
  //
  //   return {
  //     publicKey: publicKey.value,
  //     privateKey,
  //   };
  // }
}

function fetchCredentialsFromLocalStorage({ service }: { service: string }) {
  const credentials = localStorage.getItem(service);
  if (credentials) {
    return JSON.parse(credentials) as { username: string; password: string };
  }
  return null;
}

function saveCredentialsToLocalStorage({
  service,
  username,
  password,
}: {
  service: string;
  username: string;
  password: string;
}) {
  localStorage.setItem(service, JSON.stringify({ username, password }));
  return { username, password };
}
