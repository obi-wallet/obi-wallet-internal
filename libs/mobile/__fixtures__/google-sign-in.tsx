import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GDrive } from "@robinbobin/react-native-google-drive-api-wrapper";
import { useEffect } from "react";

GoogleSignin.configure({
  iosClientId:
    "1039458055047-gpjb5ifisblq42br1eq2pubq3l8rmub4.apps.googleusercontent.com",
  scopes: [
    "https://www.googleapis.com/auth/drive.appdata",
    "https://www.googleapis.com/auth/drive.appfolder",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.resource",
  ],
});

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

async function createKeyIfNotExists() {
  const gDrive = await createGDrive();
  try {
    const file = await gDrive.files.get("key.json");
    console.log(file);
  } catch (e) {
    // noop
  }
}

async function createGDrive() {
  await getUserInfo();
  const gDrive = new GDrive();
  gDrive.accessToken = (await GoogleSignin.getTokens()).accessToken;
  return gDrive;
}

export default () => {
  // const [userInfo, setUserInfo] = useState<User | null>(null);
  useEffect(() => {
    (async () => {
      await createKeyIfNotExists();
    })();
  }, []);

  // console.log(userInfo);

  return null;
};
