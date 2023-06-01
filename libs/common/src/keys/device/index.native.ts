import { generateSec256k1KeyPair } from "@obi-wallet/sdk";
import { isEmulator } from "react-native-device-info";
import * as Keychain from "react-native-keychain";
import invariant from "tiny-invariant";

const BIOMETRICS_KEY = "obi-wallet-biometrics";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

export async function existsKeyOnDevice({ publicKey }: { publicKey: string }) {
  if (publicKey === DEMO_PUBLIC_KEY) return true;

  try {
    await getBiometricsPrivateKey({ publicKey });
    return true;
  } catch (e) {
    return false;
  }
}

export async function resetBiometricsKeyPair() {
  await Keychain.resetGenericPassword({ service: BIOMETRICS_KEY });
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

  const credentials = await fetchCredentialsFromKeyChain({
    service: `${BIOMETRICS_KEY}/${publicKey}`,
  });

  if (credentials) return credentials.password;

  const fallbackCredentials = await fetchCredentialsFromKeyChain({
    service: BIOMETRICS_KEY,
  });

  if (fallbackCredentials && fallbackCredentials.username === publicKey) {
    await saveCredentialsToKeyChain({
      service: `${BIOMETRICS_KEY}/${publicKey}`,
      username: publicKey,
      password: fallbackCredentials.password,
    });
    return fallbackCredentials.password;
  }

  invariant(false, "Key not found on device.");
}

export async function getBiometricsKeyPair({
  demoMode,
}: {
  demoMode: boolean;
}) {
  if (demoMode) {
    return {
      privateKey: DEMO_PRIVATE_KEY,
      publicKey: DEMO_PUBLIC_KEY,
    };
  }

  const credentials = await fetchCredentialsFromKeyChain({
    service: BIOMETRICS_KEY,
  });

  if (credentials) {
    return {
      publicKey: credentials.username,
      privateKey: credentials.password,
    };
  } else {
    // Fake-AuthPrompt (set+get) to trigger Prompt at initial App-Start
    await Keychain.resetGenericPassword({ service: "fake-prompt" });
    await saveCredentialsToKeyChain({
      service: "fake-prompt",
      username: "fake1",
      password: "fake2",
    });
    await fetchCredentialsFromKeyChain({ service: "fake-prompt" });

    const { publicKey, privateKey } = generateSec256k1KeyPair();

    await saveCredentialsToKeyChain({
      service: BIOMETRICS_KEY,
      username: publicKey.value,
      password: privateKey,
    });
    await saveCredentialsToKeyChain({
      service: `${BIOMETRICS_KEY}/${publicKey}`,
      username: publicKey.value,
      password: privateKey,
    });

    return {
      publicKey: publicKey.value,
      privateKey,
    };
  }
}

async function fetchCredentialsFromKeyChain({ service }: { service: string }) {
  const isEmu = await isEmulator();
  return await Keychain.getGenericPassword({
    authenticationPrompt: {
      title: "Authentication Required",
    },
    service,
    ...(isEmu
      ? {}
      : {
          accessControl:
            Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
        }),
  });
}

async function saveCredentialsToKeyChain({
  service,
  username,
  password,
}: {
  service: string;
  username: string;
  password: string;
}) {
  const isEmu = await isEmulator();
  return await Keychain.setGenericPassword(username, password, {
    service,
    ...(isEmu
      ? {}
      : {
          accessControl:
            Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
        }),
  });
}
