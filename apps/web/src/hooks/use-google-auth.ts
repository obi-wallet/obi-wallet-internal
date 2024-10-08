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
    signOut();
    showSuccess("The Key File is successfully uploaded to google drive!");
  };

  const readFiles = async (): Promise<
    { id: string; name: string }[] | null
  > => {
    const accessToken = await getToken();

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
    const accessToken = await getToken();
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
    signOut();
    showSuccess("The Key File is successfully imported!");
    return fileContent;
  };

  return { uploadFile, readFiles, readFileById };
}
