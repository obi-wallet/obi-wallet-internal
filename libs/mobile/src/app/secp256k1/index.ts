import {
  coins,
  pubkeyToAddress,
  pubkeyType,
  Secp256k1Wallet,
} from "@cosmjs/amino";
import {
  createLcdClient,
  createStargateClient,
  WalletType,
} from "@obi-wallet/common";
import { MsgSend, RawKey, SimplePublicKey } from "@terra-money/terra.js";
import secp256k1 from "secp256k1";

import { getRootStore } from "../../background/root-store";
import { createSigningStargateClient } from "../clients";
import { lendFees } from "../fee-lender-worker";

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
    case WalletType.Multisig: {
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
      const { chainId, denom } = chainStore.currentTerraChainInformation;

      const client = await createLcdClient(chainId);

      const address = SimplePublicKey.fromAmino({
        type: pubkeyType.secp256k1,
        value: publicKey,
      }).address();

      try {
        await client.auth.accountInfo(address);
      } catch (e) {
        await lendFees({
          chainId,
          address,
        });
      }

      // TODO: here we need to wait longer as long as status code is 404
      const account = await client.auth.accountInfo(address);

      if (!account.getPublicKey()) {
        const key = new RawKey(Buffer.from(privateKeyUint8Array));
        const wallet = client.wallet(key);
        const send = new MsgSend(address, address, { [denom]: 1 });
        // TODO: handle gas prices?
        const tx = await wallet.createAndSignTx({ msgs: [send] });
        await client.tx.broadcast(tx);
      }

      break;
    }
  }

  return secp256k1.ecdsaSign(payload, privateKeyUint8Array);
}
