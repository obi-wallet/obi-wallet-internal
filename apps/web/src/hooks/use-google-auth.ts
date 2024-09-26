import { serialize } from "@obi-wallet/sdk-json";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { gapi } from "gapi-script";
import { useEffect, useState, useCallback } from "react";

export function useGoogleAuth() {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

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

  const signIn = async (): Promise<gapi.auth2.GoogleUser | null> => {
    console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
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
      fileContent: object,
      fileName: string,
      mimeType = "application/json",
    ) => {
      if (!isSignedIn) {
        console.error("User is not signed in");
        return null;
      }

      const accessToken = gapi.auth2
        .getAuthInstance()
        .currentUser.get()
        .getAuthResponse().access_token;

      const file = new Blob([serialize(fileContent)], { type: mimeType }); // Convert object to JSON string
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

  const readFiles = async (): Promise<
    [{ id: string; name: string }] | null
  > => {
    const accessToken = gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse().access_token;

    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=mimeType='application/json'&fields=files(id,name)",
      {
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      },
    );

    const data = await response.json();
    console.log("Files in Google Drive:", data.files);

    return data.files;
  };

  const readFileById = async (
    fileId: string,
  ): Promise<Secp256k1KeyPair | null> => {
    const accessToken = gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse().access_token;

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Error fetching file");
      }

      const fileContent = await response.json();
      console.log("File content:", fileContent);
      return fileContent;
    } catch (error) {
      console.error("Error reading file by ID:", error);
      return null;
    }
  };

  return { isSignedIn, signIn, signOut, uploadFile, readFiles, readFileById };
}
