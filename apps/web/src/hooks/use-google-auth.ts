import { useStore } from "@/contexts";
import { serialize } from "@obi-wallet/sdk-json";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { useState } from "react";
import { useEffectOnceWhen } from "rooks";

import { useAlert } from "./alert";

const SCOPE = "https://www.googleapis.com/auth/drive.appdata";

export function useGoogleAuth() {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const { showSuccess, showWarning } = useAlert();
  const { googleApiStore } = useStore();

  useEffectOnceWhen(async () => {
    const start = async (): Promise<void> => {
      const gapi = await googleApiStore.getGapi();
      try {
        await gapi.client.init({
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY,
          scope: SCOPE,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
        });

        const auth = gapi.auth2.getAuthInstance();
        setIsSignedIn(auth.isSignedIn.get());
        auth.isSignedIn.listen(setIsSignedIn);
      } catch (error) {
        console.error("Error initializing Google API client:", error);
      }
    };

    const gapi = await googleApiStore.getGapi();
    gapi.load("client:auth2", start);
  });

  const signIn = async (): Promise<void> => {
    const gapi = await googleApiStore.getGapi();
    try {
      await gapi.auth2.getAuthInstance().signIn();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const signOut = async (): Promise<void> => {
    const gapi = await googleApiStore.getGapi();
    try {
      await gapi.auth2.getAuthInstance().signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const uploadFile = async (
    fileContent: Secp256k1KeyPair,
    fileName: string,
    mimeType = "application/json",
  ) => {
    const gapi = await googleApiStore.getGapi();
    if (!isSignedIn) await signIn();

    const accessToken = gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse().access_token;

    const metadata = {
      name: fileName,
      mimeType: mimeType,
    };

    const response = await fetch("/api/google-drive/upload-file", {
      method: "POST",
      body: serialize({
        accessToken,
        metadata,
        fileContent,
      }),
    });
    if (!response.ok) {
      throw new Error("Invalid Response!");
    }
    await signOut();
    showSuccess("The Key File is successfully uploaded to google drive!");
  };

  const readFiles = async (): Promise<
    { id: string; name: string }[] | null
  > => {
    const gapi = await googleApiStore.getGapi();
    if (!isSignedIn) await signIn();

    const accessToken = gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse().access_token;

    const response = await fetch("/api/google-drive/read-files", {
      method: "POST",
      body: serialize({
        accessToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Invalid Response!");
    }
    const data = await response.json();
    if (data.files.length === 0) showWarning("No Key File is founded!");

    return data.files;
  };

  const readFileById = async (
    fileId: string,
  ): Promise<Secp256k1KeyPair | null> => {
    const gapi = await googleApiStore.getGapi();
    if (!isSignedIn) await signIn();

    const accessToken = gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse().access_token;

    const response = await fetch("/api/google-drive/read-file-by-id", {
      method: "POST",
      body: serialize({
        accessToken,
        fileId,
      }),
    });

    if (!response.ok) {
      throw new Error("Error fetching file");
    }

    const fileContent = await response.json();
    await signOut();
    showSuccess("The Key File is successfully imported!");
    return fileContent;
  };

  return { isSignedIn, signIn, signOut, uploadFile, readFiles, readFileById };
}
