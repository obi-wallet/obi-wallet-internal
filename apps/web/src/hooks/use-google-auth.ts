import { serialize } from "@obi-wallet/sdk-json";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import {
  googleLogout,
  TokenResponse,
  useGoogleLogin,
} from "@react-oauth/google";
import { useRef } from "react";

import { useAlert } from "./alert";

const SCOPE = "https://www.googleapis.com/auth/drive.appdata";

type TokenResponseSuccess = Omit<
  TokenResponse,
  "error" | "error_description" | "error_uri"
>;
type TokenResponseError = Pick<
  TokenResponse,
  "error" | "error_description" | "error_uri"
>;

export function useGoogleAuth() {
  const { showSuccess, showWarning } = useAlert();

  const callbackRef = useRef<{
    resolve: (value: TokenResponseSuccess) => void;
    reject: (error: TokenResponseError) => void;
  }>();
  const tokenResponseRef = useRef<TokenResponseSuccess | null>(null);

  const googleLogin = useGoogleLogin({
    scope: SCOPE,
    onSuccess: (tokenResponse) => {
      callbackRef.current?.resolve(tokenResponse);
    },
    onError: (error) => {
      callbackRef.current?.reject(error);
    },
  });

  const signOut = () => {
    tokenResponseRef.current = null;
    googleLogout();
  };

  const getToken = async (): Promise<string> => {
    if (tokenResponseRef.current) {
      return tokenResponseRef.current.access_token;
    }
    const p = new Promise<TokenResponseSuccess>((resolve, reject) => {
      callbackRef.current = {
        resolve,
        reject,
      };
    });
    googleLogin();
    tokenResponseRef.current = await p;
    return tokenResponseRef.current.access_token;
  };

  const uploadFile = async (
    fileContent: Secp256k1KeyPair,
    fileName: string,
    mimeType = "application/json",
  ) => {
    const accessToken = await getToken();

    const metadata = {
      name: fileName,
      mimeType: mimeType,
    };

    const file = new Blob([serialize(fileContent)], {
      type: metadata.mimeType,
    });
    const form = new FormData();
    form.append(
      "metadata",
      new Blob([serialize({ ...metadata, parents: ["appDataFolder"] })], {
        type: "application/json",
      }),
    );
    form.append("file", file);

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
    if (response.status !== 200) {
      throw new Error(`Invalid Response: ${await response.text()}`);
    }

    signOut();
    showSuccess("The Key File is successfully uploaded to google drive!");
  };

  const readFiles = async (): Promise<
    { id: string; name: string }[] | null
  > => {
    const accessToken = await getToken();

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("mimeType='application/json'")}&fields=${encodeURIComponent("files(id,name)")}&spaces=appDataFolder`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      },
    );

    if (response.status !== 200) {
      throw new Error(`Invalid Response: ${await response.text()}`);
    }
    const data = await response.json();
    if (data.files.length === 0) showWarning("No Key File is founded!");

    return data.files;
  };

  const readFileById = async (
    fileId: string,
  ): Promise<Secp256k1KeyPair | null> => {
    const accessToken = await getToken();
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      },
    );

    if (response.status !== 200) {
      throw new Error(`Error fetching file: ${await response.text()}`);
    }

    const fileContent = await response.json();
    signOut();
    showSuccess("The Key File is successfully imported!");
    return fileContent;
  };

  return { uploadFile, readFiles, readFileById };
}
