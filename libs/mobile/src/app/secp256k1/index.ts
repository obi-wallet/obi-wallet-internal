import {
  coins,
  pubkeyToAddress,
  pubkeyType,
  Secp256k1Wallet,
} from "@cosmjs/amino";
import {
  createStargateClient,
  lendFees,
  terra,
  WalletType,
} from "@obi-wallet/common";
import { RawKey } from "@terra-money/terra.js";
import secp256k1 from "secp256k1";

import { getRootStore } from "../../background/root-store";
import { createSigningStargateClient } from "../clients";

export async function prepareWalletAndSign({
  publicKey,
  privateKey,
  payload,
}: {
  publicKey: string;
  privateKey: string;
  payload: Uint8Array;
}): Promise<ReturnType<typeof secp256k1.ecdsaSign>> {
  const privateKeyUint8Array = new Uint8Array(
    Buffer.from(privateKey, "base64")
  );

  const { chainStore, configStore } = getRootStore();

  switch (configStore.getDefaultMultisigWalletType()) {
    case WalletType.CosmosMultisig: {
      const { chainId, prefix, denom } =
        chainStore.currentCosmosChainInformation;
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
      break;
    }
    case WalletType.TerraMultisig: {
      const { chainId } = chainStore.currentTerraChainInformation;
      const key = new RawKey(Buffer.from(privateKeyUint8Array));
      await terra.prepareKey({ key, chainId });
      break;
    }
  }

  return secp256k1.ecdsaSign(payload, privateKeyUint8Array);
}
