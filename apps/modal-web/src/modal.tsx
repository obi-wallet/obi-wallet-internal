"use client";

import { create, get } from "@github/webauthn-json";
import {
  obiModalConfig,
  osmosisModalConfig,
  vertexModalConfig,
  ztxModalConfig,
} from "@obi-wallet/config";
import * as M from "@obi-wallet/modal";
import { CredentialDeviceType } from "@simplewebauthn/typescript-types";
import { useEffect } from "react";
type AttestationFormat =
  | "fido-u2f"
  | "packed"
  | "android-safetynet"
  | "android-key"
  | "tpm"
  | "apple"
  | "none";

interface EncodedDevicePublicKey {
  aaguid: string;
  devicePubKey: string;
  scope: number;
  nonce?: string;
  fmt?: AttestationFormat;
  attStmt?: {
    sig?: string;
    x5c?: string[];
    response?: string;
    alg?: number;
    ver?: string;
    certInfo?: string;
    pubArea?: string;
  };
  sig?: string;
  credentialID: string;
}

interface CustomPublicKeyCredentialCreationOptions {
  challenge: string;
  rp: {
    name: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: "public-key"; // Use a string literal type here
    alg: number;
  }>;
  authenticatorSelection: {
    authenticatorAttachment: "platform" | "cross-platform";
    browser?: string;
    os?: string;
    platform?: string;
    lastUsed?: number;
    credentialDeviceType?: CredentialDeviceType;
    credentialBackedUp?: boolean;
    clientExtensionResults?: unknown;
    devicePubKeys?: EncodedDevicePublicKey[];
  };
}

// eslint-disable-next-line mobx/missing-observer,import/no-default-export
export default function Modal(props: { config: string }) {
  const config = getConfig();

  async function handleWebAuthnRoute() {
    // Your custom logic for when the app is accessed at /webauthn-auth
    let challenge = new Uint8Array(32); // Normally, this challenge is provided by the server.
    if (typeof window !== "undefined") {
      window.crypto.getRandomValues(challenge);
    } else {
      challenge = new Uint8Array(32).fill(0);
    }

    const publicKey: CustomPublicKeyCredentialCreationOptions = {
      challenge: btoa(String.fromCharCode(...challenge)),
      rp: {
        name: "Obi",
        // id: new URL(window.location.origin).hostname,
      },
      user: {
        id: btoa(String.fromCharCode(...new Uint8Array(16))),
        name: "My Obi Device Key",
        displayName: "My Obi Device Key",
      },
      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -7, // This indicates the algorithm type (e.g., ES256 for elliptic curve)
        },
        {
          type: "public-key",
          alg: -257, // Value registered by this specification for "RS256"
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
      },
    };
    let credential;
    switch (window.location.pathname) {
      case "/webauthn-auth":
        credential = await create({ publicKey });
        break;
      case "/webauthn-get":
        credential = await get({ publicKey });
        break;
      default:
        break;
    }
    window.opener.postMessage({ type: "webauthn", credential }, "*");
    window.close();
  }

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window.location.pathname === "/webauthn-auth" ||
        window.location.pathname === "/webauthn-get")
    ) {
      // Your logic for /webauthn-auth route
      handleWebAuthnRoute();
    }
  }, []);

  return (
    <M.Modal
      config={config}
      env={{
        PHONE_NUMBER_KEY_SECRET:
          process.env.NEXT_PUBLIC_PHONE_NUMBER_KEY_SECRET!,
        PHONE_NUMBER_TWILIO_BASIC_AUTH_USER:
          process.env.NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_USER!,
        PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD:
          process.env.NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD!,
      }}
    />
  );

  function getConfig() {
    switch (props.config) {
      case "obi":
        return obiModalConfig;
      case "osmosis":
        return osmosisModalConfig;
      case "vertex":
        return vertexModalConfig;
      case "ztx":
        return ztxModalConfig;
      default:
        return obiModalConfig;
    }
  }
}
