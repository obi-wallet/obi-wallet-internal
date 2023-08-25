import { SecretJsChainId, generateSec256k1KeyPair } from "@obi-wallet/sdk";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { connectWorkaround } from "../../../../src/db";
import { generateEthereumAddress } from "../../../../src/stackup";
import { fetchUserId } from "../../../../src/zauth";

export async function POST(request: Request) {
  const body: {
    accessToken?: string;
    refreshToken?: string;
    homeChainId: SecretJsChainId;
  } = await request.json();

  const accessToken =
    body.accessToken ?? cookies().get("zepetoAccessToken")?.value;
  const refreshToken =
    body.refreshToken ?? cookies().get("zepetoRefreshToken")?.value;

  const userId = accessToken ? await fetchUserId(accessToken) : null;

  if (!accessToken || !refreshToken || !userId) {
    return NextResponse.json(
      {
        error: "invalid token",
      },
      { status: 401 },
    );
  }

  async function fetchOrCreateUser() {
    const UserModel = await connectWorkaround();
    const existingUser = await UserModel.findOne({ userId });

    if (existingUser) {
      return {
        newUser: false,
        publicKey: existingUser.zAuthKeyPair.publicKey,
        proxyAddress: "MISSING",
        ethereumAccount: {
          publicKey: existingUser.ethKeyPair.publicKey,
          address: existingUser.evmAddress,
        },
      };
    }

    const keyPair = generateSec256k1KeyPair();
    const ethKeyPair = generateSec256k1KeyPair();
    const evmAddress = await generateEthereumAddress(ethKeyPair);

    await UserModel.create({
      userId,
      ethKeyPair,
      zAuthKeyPair: keyPair,
      evmAddress,
    });

    return {
      newUser: true,
      publicKey: keyPair.publicKey,
      ethereumAccount: {
        publicKey: ethKeyPair.publicKey,
        address: evmAddress,
      },
    };
  }

  const user = await fetchOrCreateUser();

  cookies().set({
    name: "zepetoAccessToken",
    value: accessToken,
    httpOnly: true,
    maxAge: 3600000,
    path: "/",
    ...(process.env.NODE_ENV === "production"
      ? {
          sameSite: "none",
          secure: true,
        }
      : {}),
  });
  cookies().set({
    name: "zepetoRefreshToken",
    value: refreshToken,
    httpOnly: true,
    maxAge: 3600000,
    path: "/",
    ...(process.env.NODE_ENV === "production"
      ? {
          sameSite: "none",
          secure: true,
        }
      : {}),
  });

  return NextResponse.json(user);
}
