import { serialize } from "@obi-wallet/sdk-json";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { gapi } from "gapi-script";
import { useEffect, useState } from "react";

import { useAlert } from "./alert";

export function useGoogleAuth() {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const { showSuccess, showWarning } = useAlert();
  const [isUploading, setIsUploading] = useState<boolean>(false); // State to track upload status

  useEffect(() => {
    const start = async (): Promise<void> => {
      try {
        await gapi.client.init({
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY,
          scope: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_SCOPE,
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

    gapi.load("client:auth2", start);
  }, []);

  const signIn = async (): Promise<void> => {
    try {
      await gapi.auth2.getAuthInstance().signIn();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const signOut = async (): Promise<void> => {
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
    if (isUploading) return;
    setIsUploading(true);

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
    setIsUploading(false);
    await signOut();
    showSuccess("The Key File is successfully uploaded to google drive!");
  };

  const readFiles = async (): Promise<
    { id: string; name: string }[] | null
  > => {
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
