import { IntentionsPayload } from "@/keys/intentions-handler";
import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { TargetChain } from "@/target-chain";
import { BitcoinChainId } from "@/target-chain/bitcoin/chains";
import { createTestSuite } from "@/tests";
import { IntentionsResults } from "@/user-interactions/approve-intentions/utils";
import { expect } from "@jest/globals";
import { MpcWallet, Secp256k1PrivateKeySigner } from "@obi-wallet/sdk";
import * as bitcoinjs from "bitcoinjs-lib";
import { createHash } from "crypto";
import invariant from "tiny-invariant";

export const testSuite = createTestSuite(({ test }) => {
  test("computeAddress produces valid Bitcoin address", async () => {
    const wallet = MpcWallet.create(MOCK_WALLET_DATA);
    invariant(wallet.owner.primaryKey, "Primary key should be set");

    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const _signer = await targetChain.mpcSigner(wallet);

    const publicKey = wallet.owner.primaryKey.publicKey;
    const address = targetChain.computeAddress(publicKey);
    const isValid = targetChain.validateAddress(address);

    expect(isValid).toBe(true);
  });

  test("signMessage signs message correctly", async () => {
    const wallet = MpcWallet.create(MOCK_WALLET_DATA);
    invariant(wallet.owner.primaryKey, "Primary key should be set");

    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const _signer = await targetChain.mpcSigner(wallet);

    const message = "Test message";
    const messageHash = createHash("sha256").update(message).digest();

    // Simulate MPC intentions payload and results
    const intentionsPayload: IntentionsPayload = {
      signHashes: [messageHash],
      decryptMessages: [],
      decryptMultisigKeyEncryptedMessages: [],
      decryptEasyShare: [],
      decryptPrimaryKeyEncryptedMessages: [],
    };

    const intentionsResults: IntentionsResults = {
      signedHashes: [
        await new Secp256k1PrivateKeySigner(
          wallet.owner.primaryKey.payload.privateKey,
        ).signHash(messageHash),
      ],
      decryptedMessages: [],
      decryptedShares: [],
    };

    _signer.addIntentionsResults({
      payload: intentionsPayload,
      results: intentionsResults,
    });

    const signature = await _signer.signMessage(message);

    // Verify the signature
    const isValid = _signer.verifyMessage(signature, message);
    expect(isValid).toBe(true);
  });

  test("signTransaction constructs and signs transaction", async () => {
    const wallet = MpcWallet.create(MOCK_WALLET_DATA);
    invariant(wallet.owner.primaryKey, "Primary key should be set");

    const targetChain = TargetChain.chainId(BitcoinChainId.Testnet);
    const _signer = await targetChain.mpcSigner(wallet);

    const psbt = new bitcoinjs.Psbt({ network: bitcoinjs.networks.testnet });

    const prevTx = new bitcoinjs.Transaction();
    prevTx.version = 1;

    // Add a fake output to prevTx
    const _fakeOutputScript = bitcoinjs.address.toOutputScript(
      await _signer.getAddress(),
      bitcoinjs.networks.testnet,
    );
    const prevTxHex = prevTx.toHex();
    const txid = prevTx.getHash(false).reverse().toString();

    psbt.addInput({
      hash: txid,
      index: 0,
      nonWitnessUtxo: Buffer.from(prevTxHex, "hex"),
    });

    psbt.addOutput({
      address: "tb1qlw09ycnp3qgqw9alqgx93ed7cg5kmnyud326ky",
      value: 90000n,
    });

    // Add change output back to ourselves
    psbt.addOutput({
      address: await _signer.getAddress(),
      value: 100000n - 90000n - 1000n,
    });

    const psbtBase64 = psbt.toBase64();

    const signedPsbtBase64 = await _signer.signTransaction(psbtBase64);
    console.error("signedPsbtBase64: ", signedPsbtBase64);
  });
});
