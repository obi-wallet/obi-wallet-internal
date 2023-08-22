import { Secp256k1PrivateKeySigner, SecretJsChainId } from "@obi-wallet/sdk";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { connect } from "../../../../src/db";
import { fetchUserId } from "../../../../src/zauth";

export async function POST(request: Request) {
  const body: {
    accessToken?: string;
    refreshToken?: string;
    homeChainId: SecretJsChainId;
    hash?: string;
    message?: string;
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

  if (!body.homeChainId || !body.hash || !body.message) {
    return NextResponse.json(
      {
        error: "invalid params",
      },
      { status: 400 },
    );
  }

  const UserModel = await connect();
  const user = await UserModel.findOne({ userId });

  const signer = new Secp256k1PrivateKeySigner(user.homePrivateKey);

  const response: { signedHash?: string; signedMessage?: string } = {};
  if (body.hash) {
    response.signedHash = Buffer.from(
      await signer.signHash(new Uint8Array(Buffer.from(body.hash, "base64"))),
    ).toString("base64");
  }

  if (body.message) {
    response.signedMessage = (
      await signer.sign(Buffer.from(body.message, "utf-8"))
    ).toString("base64");
  }

  return NextResponse.json(response);
}
