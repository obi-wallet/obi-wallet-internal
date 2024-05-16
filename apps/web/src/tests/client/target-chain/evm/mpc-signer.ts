import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { TargetChain } from "@/target-chain";
import { EvmChainId, EvmChains } from "@/target-chain/evm/chains";
import { EvmMpcSigner } from "@/target-chain/evm/mpc-signer";
import { createTestSuite, expect } from "@/tests";
import { IntentionsResults } from "@/user-interactions/approve-intentions";
import { MpcWallet, Secp256k1PrivateKeySigner } from "@obi-wallet/sdk";
import { signerToEcdsaKernelSmartAccount } from "permissionless/accounts";
import invariant from "tiny-invariant";
import { createPublicClient, http } from "viem";
import { toAccount } from "viem/accounts";

export const testSuite = createTestSuite(({ test }) => {
  test("signMessage", async () => {
    const wallet = MpcWallet.create(MOCK_WALLET_DATA);
    invariant(wallet.owner.primaryKey, "Expected primary key to be set");

    const signer = await EvmMpcSigner.fromWallet(wallet, EvmChainId.Arbitrum);

    const message = "hello world";

    const account = toAccount(signer.accountSource);

    const publicClient = createPublicClient({
      chain: EvmChains[EvmChainId.Arbitrum].chain,
      transport: http(),
    });

    const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
      entryPoint: TargetChain.chainId(EvmChainId.Arbitrum).entryPoint,
      signer: account,
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
      decryptedShares: [],
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
