import {
  coins,
  pubkeyToAddress,
  pubkeyType,
  Secp256k1Wallet,
} from "@cosmjs/amino";
import {
  Chain,
  cosmosChains,
  createStargateClient,
  isCosmosChain,
  isTerraChain,
  lendFees,
  terra,
} from "@obi-wallet/common";
import { RawKey } from "@terra-money/terra.js";

import { createSigningStargateClient } from "../app/clients";

export function getPrepareKeyQuery({
  chainId,
  publicKey,
  privateKey,
}: {
  chainId: Chain;
  publicKey: string;
  privateKey: string;
}) {
  return {
    queryKey: ["prepare-key", { chainId, publicKey, privateKey }],
    queryFn: async () => {
      const privateKeyUint8Array = new Uint8Array(
        Buffer.from(privateKey, "base64")
      );

      if (isCosmosChain(chainId)) {
        const { prefix, denom } = cosmosChains[chainId];
        const client = await createStargateClient(chainId);

        const address = pubkeyToAddress(
          {
            type: pubkeyType.secp256k1,
            value: publicKey,
          },
          prefix
        );

        if (!(await client.getAccount(address))) {
          await lendFees({ chainId, address });
        }

        // TODO: here we need to wait longer as long as account does not exist

        if (!(await client.getAccount(address))?.pubkey) {
          const signer = await Secp256k1Wallet.fromKey(
            privateKeyUint8Array,
            prefix
          );
          const signingClient = await createSigningStargateClient({
            chainId,
            signer,
          });
          await signingClient.sendTokens(
            address,
            address,
            coins(1, denom),
            "auto",
            ""
          );
        }
      }

      if (isTerraChain(chainId)) {
        const key = new RawKey(Buffer.from(privateKeyUint8Array));
        await terra.prepareKey({ key, chainId });
      }

      return true;
    },
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  };
}
