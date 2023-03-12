import { TerraChain, terraChains, withTerraClient } from "@obi-wallet/sdk";
import {
  Account,
  Key,
  LegacyAminoMultisigPublicKey,
  Msg,
  MsgSend,
  MultiSignature,
  SignatureV2,
  SignDoc,
  Tx,
} from "@terra-money/feather.js";
import { AxiosError } from "axios";
import { z } from "zod";

import { getTxGasOptions } from "./gas-information";
import { lendFees } from "../../fee-lender-worker";

export const SdkError = z.object({
  code: z.number(),
  message: z.string(),
});

export async function createAndSignSinglesigTransaction({
  key,
  messages,
  chainId,
}: {
  key: Key;
  messages: Msg[];
  chainId: TerraChain;
}) {
  return await withTerraClient(chainId, async (client) => {
    const wallet = client.wallet(key);

    await prepareKey({ key, chainId });

    return await wallet.createAndSignTx({
      chainID: chainId,
      msgs: messages,
    });
  });
}

export async function createMultisigTransaction({
  key,
  messages,
  chainId,
}: {
  key: LegacyAminoMultisigPublicKey;
  messages: Msg[];
  chainId: TerraChain;
}) {
  const address = key.address("terra");

  const account = await prepareAccount({ address, chainId });

  try {
    return await withTerraClient(chainId, async (client) => {
      const transaction = await client.tx.create(
        [
          {
            address,
            sequenceNumber: account.getSequenceNumber(),
            publicKey: account.getPublicKey(),
          },
        ],
        {
          chainID: chainId,
          msgs: messages,
          ...(await getTxGasOptions({ chainId })),
        }
      );

      const signDoc = new SignDoc(
        chainId,
        account.getAccountNumber(),
        account.getSequenceNumber(),
        transaction.auth_info,
        transaction.body
      );

      return {
        signDoc,
        sign(signatures: SignatureV2[]) {
          const multiSignature = new MultiSignature(key);
          multiSignature.appendSignatureV2s(signatures);
          transaction.appendSignatures([
            new SignatureV2(
              key,
              multiSignature.toSignatureDescriptor(),
              account.getSequenceNumber()
            ),
          ]);
          return transaction;
        },
      };
    });
  } catch (e) {
    const error = e as AxiosError;
    const data = error.response?.data;

    const result = SdkError.safeParse(data);
    if (result.success) {
      console.error(result.data.message);
    }

    throw e;
  }
}

export async function simulateTransaction({
  transaction,
  chainId,
}: {
  transaction: Tx;
  chainId: TerraChain;
}) {
  return await withTerraClient(chainId, async (client) => {
    return await client.tx.estimateGas(transaction, chainId);
  });
}

export async function prepareKey({
  key,
  chainId,
}: {
  key: Key;
  chainId: TerraChain;
}) {
  const address = key.accAddress("terra");

  let account: Account | null = await prepareAccount({ address, chainId });

  if (!account?.getPublicKey()) {
    return await withTerraClient(chainId, async (client) => {
      const wallet = client.wallet(key);
      const { denom } = terraChains[chainId];
      const send = new MsgSend(address, address, { [denom]: 1 });
      const tx = await wallet.createAndSignTx({
        chainID: chainId,
        msgs: [send],
        ...(await getTxGasOptions({ chainId })),
      });
      await client.tx.broadcastBlock(tx, chainId);
    });
  }

  while (!account?.getPublicKey()) {
    await wait({ ms: 1000 });
    account = await getAccount({ address, chainId });
  }
}

export async function prepareAccount({
  address,
  chainId,
}: {
  address: string;
  chainId: TerraChain;
}) {
  let account = await getAccount({ address, chainId });
  if (!account) {
    await lendFees({
      chainId,
      address,
    });
  }
  while (!account) {
    await wait({ ms: 1000 });
    account = await getAccount({ address, chainId });
  }
  return account;
}

export async function getAccount({
  address,
  chainId,
}: {
  address: string;
  chainId: TerraChain;
}): Promise<Account | null> {
  try {
    return await withTerraClient(chainId, async (client) => {
      return await client.auth.accountInfo(address);
    });
  } catch (e) {
    const error = e as AxiosError;
    const data = error.response?.data;

    const result = SdkError.safeParse(data);
    if (result.success && result.data.message.includes("code = NotFound")) {
      return null;
    }

    throw e;
  }
}

function wait({ ms }: { ms: number }) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
