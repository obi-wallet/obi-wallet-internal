import { serialize } from "@obi-wallet/sdk-json";
import { gapi } from "gapi-script";
import { useEffect, useState, useCallback } from "react";

const CLIENT_ID =
  "450981852892-sj5e8fks9u1frgehjnfcgb16fn62iev0.apps.googleusercontent.com";
const API_KEY = "AIzaSyB-xaM6JPc5VWQZgKfXN_R13TJeK7mcAX4";
const SCOPE = "https://www.googleapis.com/auth/drive.file";

export function useGoogleAuth() {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  useEffect(() => {
    const start = async (): Promise<void> => {
      try {
        await gapi.client.init({
          clientId: CLIENT_ID,
          apiKey: API_KEY,
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

    gapi.load("client:auth2", start);
  }, []);

  const signIn = async (): Promise<gapi.auth2.GoogleUser | null> => {
    try {
      return await gapi.auth2.getAuthInstance().signIn();
    } catch (error) {
      console.error("Error signing in:", error);
      return null;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const result = await gapi.auth2.getAuthInstance().signOut();
      return result;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const uploadFile = useCallback(
    async (
      fileContent: string | ArrayBuffer,
      fileName: string,
      mimeType: string,
    ) => {
      if (!isSignedIn) {
        console.error("User is not signed in");
        return null;
      }

      const accessToken = gapi.auth2
        .getAuthInstance()
        .currentUser.get()
        .getAuthResponse().access_token;

      const file = new Blob([fileContent], { type: mimeType });
      const metadata = {
        name: fileName,
        mimeType: mimeType,
      };

      const form = new FormData();
      form.append(
        "metadata",
        new Blob([serialize(metadata)], { type: "application/json" }),
      );
      form.append("file", file);
      try {
        const response = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
          {
            method: "POST",
            headers: new Headers({
              Authorization: `Bearer ${accessToken}`,
            }),
            body: form,
          },
        );

        const data = await response.json();
        console.log("File uploaded successfully", data);
        return data;
      } catch (error) {
        console.error("Error uploading file", error);
        throw error;
      }
    },
    [isSignedIn],
  );

  return { isSignedIn, signIn, signOut, uploadFile };
}
