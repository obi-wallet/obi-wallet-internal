import { setWalletData } from "@/wallet-data-backup/worker-client";
import {
  createHash,
  MultisigPublicKey,
  Sdk,
  SecretJsClient,
  WalletData,
} from "@obi-wallet/sdk";
import { NextResponse } from "next/server";
import * as secp256k1 from "secp256k1";
import { z } from "zod";

const schema = z.object({
  userAccountAddress: z.string(),
  userAccountCodeHash: z.string(),
  serializedWalletData: z.string(),
  signatures: z.array(z.string()),
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    console.error(result.error.errors);
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const {
    serializedWalletData,
    signatures,
    userAccountAddress,
    userAccountCodeHash,
  } = result.data;

  const walletDataResult = WalletData.safeParse(
    JSON.parse(serializedWalletData),
  );

  if (!walletDataResult.success) {
    return new Response("Invalid wallet data", {
      status: 400,
    });
  }

  const walletData = walletDataResult.data;

  const client = new SecretJsClient(walletData.homeChainId);
  const legacyOwner: { legacy_owner: string } =
    await client.withSecretNetworkClient(async (client) => {
      return await client.query.compute.queryContract({
        contract_address: userAccountAddress,
        code_hash: userAccountCodeHash,
        query: { legacy_owner: {} },
      });
    });

  const multisigPublicKey: MultisigPublicKey = {
    type: "tendermint/PubKeyMultisigThreshold",
    value: {
      pubkeys: walletData.owner.keys.map((key) => {
        return key.publicKey;
      }),
      threshold: walletData.owner.threshold,
    },
  };

  const ownerAddress = Sdk.chainId(
    walletData.homeChainId,
  ).transactions.getAddressOfPublicKey(multisigPublicKey);

  if (legacyOwner.legacy_owner !== ownerAddress) {
    return new Response("Owner address does not match", {
      status: 401,
    });
  }

  const threshold = parseInt(walletData.owner.threshold, 10);

  if (signatures.length < threshold) {
    return new Response("Not enough signatures", {
      status: 401,
    });
  }

  const hash = createHash(Buffer.from(serializedWalletData, "utf-8"));
  const keyIndicesWithValidSignature = new Set();

  signatures.forEach((signature) => {
    const publicKey = multisigPublicKey.value.pubkeys.findIndex(
      (publicKey, index) => {
        if (keyIndicesWithValidSignature.has(index)) {
          return false;
        }
        return secp256k1.ecdsaVerify(
          Buffer.from(signature, "hex"),
          hash,
          Buffer.from(publicKey.value, "base64"),
        );
      },
    );
    if (publicKey !== -1) {
      keyIndicesWithValidSignature.add(publicKey);
    }
  });

  if (keyIndicesWithValidSignature.size < threshold) {
    return new Response("Not enough valid signatures", {
      status: 401,
    });
  }

  const response = await setWalletData(walletData);
  if (response.status !== 200) {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: response.status,
      },
    );
  }

  return NextResponse.json({
    success: true,
  });
}
