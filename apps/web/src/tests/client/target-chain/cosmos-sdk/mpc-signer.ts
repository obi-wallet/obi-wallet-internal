import { fetchPublicKey } from "@/hooks/use-public-key";
import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { createTestSuite, expect } from "@/tests";
import { IntentionsResults } from "@/user-interactions/approve-intentions";
import { StdSignature } from "@cosmjs/amino";
import { fromBase64 } from "@cosmjs/encoding";
import { Encoding, Utf8EncodedString } from "@obi-wallet/encoding";
import {
  createHash,
  MpcWallet,
  Secp256k1PrivateKeySigner,
} from "@obi-wallet/sdk";
import * as secp256k1 from "secp256k1";
import invariant from "tiny-invariant";

export const testSuite = createTestSuite(({ test }) => {
  test("signHashWithEasyShare", async () => {
    class TestCosmosSdkMpcSigner extends CosmosSdkMpcSigner {
      public static override async fromWallet(
        wallet: MpcWallet,
        targetChainId: CosmosSdkChainId,
      ): Promise<TestCosmosSdkMpcSigner> {
        const publicKey = await fetchPublicKey(wallet);
        return new TestCosmosSdkMpcSigner(wallet, publicKey, targetChainId);
      }

      public override async signHashWithEasyShare(
        address: string,
        hash: Uint8Array,
      ): Promise<StdSignature> {
        return await super.signHashWithEasyShare(address, hash);
      }
    }

    const wallet = MpcWallet.create(MOCK_WALLET_DATA);
    invariant(wallet.owner.primaryKey, "Expected primary key to be set");

    const signer = await TestCosmosSdkMpcSigner.fromWallet(
      wallet,
      CosmosSdkChainId.Sei,
    );
    const account = (await signer.getAccounts())[0];

    invariant(account, "Expected account to be set");

    const message = Utf8EncodedString.parse("hello world");
    const hash = createHash(Encoding.fromUtf8(message).toBytes());

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

    signer.addIntentionsResults({
      payload: intentionsPayload,
      results: intentionsResults,
    });

    const signature = await signer.signHashWithEasyShare(account.address, hash);

    expect(
      secp256k1.ecdsaVerify(
        fromBase64(signature.signature),
        hash,
        fromBase64(signature.pub_key.value),
      ),
    ).to.equal(true);
  });
});
