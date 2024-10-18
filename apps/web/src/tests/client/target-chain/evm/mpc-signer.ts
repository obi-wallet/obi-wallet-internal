import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { TargetChain } from "@/target-chain";
import { Eip155ChainId, Eip155Chains } from "@/target-chain/eip-155/chains";
import { Eip155MpcSigner } from "@/target-chain/eip-155/mpc-signer";
import { createTestSuite, expect } from "@/tests";
import { IntentionsResults } from "@/user-interactions/approve-intentions";
import { MpcWallet, Secp256k1PrivateKeySigner } from "@obi-wallet/sdk";
import { toEcdsaKernelSmartAccount } from "permissionless/accounts";
import invariant from "tiny-invariant";
import { createPublicClient, http } from "viem";
import { toAccount } from "viem/accounts";

export const testSuite = createTestSuite(({ test }) => {
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
      decryptPrimaryKeyEncryptedMessages: [],
      decryptMultisigKeyEncryptedMessages: [],
    };

    const intentionsResults = new IntentionsResults();
    intentionsResults.set(wallet.owner.primaryKey.publicKey.value, {
      signedHashes: [
        await new Secp256k1PrivateKeySigner(
          wallet.owner.primaryKey.payload.privateKey,
        ).signHash(hash),
      ],
      decryptedMessages: [],
      decryptedPrimaryKeyEncryptedMessagesShares: [],
      decryptedMultisigKeyEncryptedMessagesShares: [],
    });

    signer.mpcSigner.addIntentionsResults({
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
    ).to.equal(true);
  });
});
