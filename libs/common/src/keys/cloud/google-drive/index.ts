/* eslint-disable @typescript-eslint/no-unused-vars */
import invariant from "tiny-invariant";

const CLOUD_KEY = "key.json";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

export async function getCloudKeyPair({
  demoMode,
}: {
  demoMode: boolean;
}): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  invariant(false, "getCloudKeyPair not implemented for web");
  return {
    publicKey: "",
    privateKey: "",
  };
}

export async function signOut() {
  invariant(false, "signOut not implemented for web");
}
