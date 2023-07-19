import { generateSec256k1KeyPair } from "@obi-wallet/sdk";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GDrive } from "@robinbobin/react-native-google-drive-api-wrapper";

GoogleSignin.configure({
  iosClientId:
    "1039458055047-gpjb5ifisblq42br1eq2pubq3l8rmub4.apps.googleusercontent.com",
  scopes: ["https://www.googleapis.com/auth/drive.appdata"],
});

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
  if (demoMode) {
    return {
      privateKey: DEMO_PRIVATE_KEY,
      publicKey: DEMO_PUBLIC_KEY,
    };
  }

  const keyPair = await fetchKeyPairFromCloud({
    name: CLOUD_KEY,
  });

  if (keyPair) return keyPair;

  const { publicKey, privateKey } = generateSec256k1KeyPair();

  await saveKeyPairToCloud({
    name: CLOUD_KEY,
    publicKey: publicKey.value,
    privateKey,
  });

  return {
    publicKey: publicKey.value,
    privateKey,
  };
}

async function fetchKeyPairFromCloud({ name }: { name: string }) {
  const gDrive = await createGDrive();

  try {
    const { files } = await gDrive.files.list({
      name,
      spaces: ["appDataFolder"],
    });
    return await gDrive.files.getJson(files[0].id);
  } catch (e) {
    return null;
  }
}

async function saveKeyPairToCloud({
  name,
  publicKey,
  privateKey,
}: {
  name: string;
  publicKey: string;
  privateKey: string;
}) {
  const gDrive = await createGDrive();

  const uploader = gDrive.files
    .newMultipartUploader()
    .setData(
      JSON.stringify({
        publicKey,
        privateKey,
      }),
      "application/json",
    )
    .setRequestBody({
      name,
      parents: ["appDataFolder"],
    });
  await gDrive.files.createIfNotExists(
    {
      name,
      spaces: ["appDataFolder"],
    },
    uploader,
  );
}

async function createGDrive() {
  await getUserInfo();
  const gDrive = new GDrive();
  gDrive.accessToken = (await GoogleSignin.getTokens()).accessToken;
  return gDrive;
}

async function getUserInfo() {
  try {
    return await GoogleSignin.signInSilently();
  } catch (e) {
    const error = e as { code: string };
    if (error.code === statusCodes.SIGN_IN_REQUIRED) {
      return await signIn();
    } else {
      console.log(e);
      // some other error
    }
    return null;
  }
}

export async function signOut() {
  try {
    await GoogleSignin.signOut();
  } catch (e) {
    console.log(e);
  }
}

async function signIn() {
  try {
    await GoogleSignin.hasPlayServices();
    return await GoogleSignin.signIn();
  } catch (e) {
    const error = e as { code: string };
    console.log(e);
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // operation (e.g. sign in) is in progress already
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // play services not available or outdated
    } else {
      // some other error happened
    }
    return null;
  }
}
