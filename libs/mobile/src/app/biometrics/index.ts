import { randomBytes } from "crypto";
import * as Keychain from "react-native-keychain";
import secp256k1 from "secp256k1";
import invariant from "tiny-invariant";

import { prepareWalletAndSign } from "../secp256k1";

const BIOMETRICS_KEY = "obi-wallet-biometrics";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

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

    const privateKeyBuffer = randomBytes(32);
    const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);

    const privateKey = Buffer.from(privateKeyBuffer).toString("base64");
    const publicKey = Buffer.from(publicKeyBuffer).toString("base64");

    await saveCredentialsToKeyChain({
      service: BIOMETRICS_KEY,
      username: publicKey,
      password: privateKey,
    });
    await saveCredentialsToKeyChain({
      service: `${BIOMETRICS_KEY}/${publicKey}`,
      username: publicKey,
      password: privateKey,
    });

    return {
      publicKey,
      privateKey,
    };
  }
}

export async function deprecated__getBiometricsKeyPair({
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

  const credentials = await Keychain.getGenericPassword({
    authenticationPrompt: {
      title: "Authentication Required",
    },
    service: BIOMETRICS_KEY,
    accessControl:
      Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
  });

  if (credentials) {
    return {
      publicKey: credentials.username,
      privateKey: credentials.password,
    };
  } else {
    // Fake-AuthPrompt (set+get) to trigger Prompt at initial App-Start
    await Keychain.resetGenericPassword({ service: "fake-prompt" });
    await Keychain.setGenericPassword("fake1", "fake2", {
      service: "fake-prompt",
      accessControl:
        Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
    });
    await Keychain.getGenericPassword({
      authenticationPrompt: {
        title: "Authentication Required",
      },
      service: "fake-prompt",
      accessControl:
        Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
    });

    const privateKeyBuffer = randomBytes(32);
    const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);

    const privateKey = Buffer.from(privateKeyBuffer).toString("base64");
    const publicKey = Buffer.from(publicKeyBuffer).toString("base64");

    await Keychain.setGenericPassword(publicKey, privateKey, {
      service: BIOMETRICS_KEY,
      accessControl:
        Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
    });
    return {
      publicKey,
      privateKey,
    };
  }
}

export async function createBiometricsSignature({
  payload,
  publicKey,
}: {
  payload: Uint8Array;
  publicKey: string;
}) {
  const privateKey = await getBiometricsPrivateKey({ publicKey });
  return await prepareWalletAndSign({
    publicKey,
    privateKey,
    payload,
  });
}

async function fetchCredentialsFromKeyChain({ service }: { service: string }) {
  return await Keychain.getGenericPassword({
    authenticationPrompt: {
      title: "Authentication Required",
    },
    service,
    accessControl:
      Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
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
  return await Keychain.setGenericPassword(username, password, {
    service,
    accessControl:
      Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
  });
}
