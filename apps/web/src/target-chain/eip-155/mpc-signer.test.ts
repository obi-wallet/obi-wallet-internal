import { MOCK_PRIMARY_KEY_KEYPAIR } from "@/mocks/multisig-key";
import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { TargetChain } from "@/target-chain";
import { Eip155ChainId, Eip155Chains } from "@/target-chain/eip-155/chains";
import { Eip155MpcSigner } from "@/target-chain/eip-155/mpc-signer";
import { mockApproveIntentions } from "@/tests/helpers/mock-approve-intentions";
import { IntentionsResults } from "@/user-interactions/approve-intentions/utils";
import { MpcWallet } from "@obi-wallet/sdk";
import { toEcdsaKernelSmartAccount } from "permissionless/accounts";
import invariant from "tiny-invariant";
import { createPublicClient, http } from "viem";
import { toAccount } from "viem/accounts";
import { test, expect } from "vitest";

test("signMessage", async () => {
  const wallet = MpcWallet.create(MOCK_WALLET_DATA);
  invariant(wallet.owner.primaryKey, "Expected primary key to be set");

  const signer = await Eip155MpcSigner.fromWallet(
    wallet,
    Eip155ChainId.Arbitrum,
  );

  const message = "hello world";

  const account = toAccount(signer.accountSource);

  const publicClient = createPublicClient({
    chain: Eip155Chains[Eip155ChainId.Arbitrum].chain,
    transport: http(),
  });

  const kernelAccount = await toEcdsaKernelSmartAccount({
    client: publicClient,
    entryPoint: TargetChain.chainId(Eip155ChainId.Arbitrum).entryPoint,
    owners: [account],
  });

  const hash = await signer.mpcSigner.calculateHashToSign(async () => {
    await kernelAccount.signMessage({
      message,
    });
  });
  invariant(hash, "Expected hash to be set");

  const intentionsPayload = {
    signHashes: [hash],
    decryptMessages: [],
    decryptShares: {
      easy: wallet.encryptedEasyShare,
      backup: wallet.encryptedBackupShare,
      network: null,
    },
    decryptPrimaryKeyEncryptedMessages: [],
    decryptMultisigKeyEncryptedMessages: [],
  };

  const intentionsResults = new IntentionsResults();
  await mockApproveIntentions({
    multisigKey: wallet.owner,
    keyPair: MOCK_PRIMARY_KEY_KEYPAIR,
    intentions: intentionsPayload,
    results: intentionsResults,
  });
  await signer.mpcSigner.addIntentionsResults({
    payload: intentionsPayload,
    results: intentionsResults,
  });

  const signature = await kernelAccount.signMessage({
    message,
  });

  expect(
    await publicClient.verifyMessage({
      address: kernelAccount.address,
      message,
      signature,
    }),
  ).toEqual(true);
});
