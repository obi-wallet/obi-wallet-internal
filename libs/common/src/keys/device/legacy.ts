import invariant from "tiny-invariant";

const BIOMETRICS_KEY = "obi-wallet-biometrics";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

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
    return fallbackCredentials.password;
  }

  invariant(false, "Key not found on device.");
}

function fetchCredentialsFromLocalStorage({ service }: { service: string }) {
  const credentials = localStorage.getItem(service);
  if (credentials) {
    return JSON.parse(credentials) as { username: string; password: string };
  }
  return null;
}
