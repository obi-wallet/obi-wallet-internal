import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { TargetChain } from "@/target-chain";
import { BitcoinChainId } from "@/target-chain/bitcoin/chains";
import { createTestSuite } from "@/tests";
import { MpcWallet, Secp256k1PrivateKeySigner, SecretJsHomeChainId, KeyType } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";
import { createHash } from "crypto";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { IntentionsResults } from "@/user-interactions/approve-intentions";
import * as bitcoinjs from "bitcoinjs-lib";
import * as bitcoinMessage from "bitcoinjs-message";
import * as bip39 from "bip39";
import { expect, vi } from 'vitest';
import { createRootStore } from "@/stores/root";
import { Config, Feature } from "@obi-wallet/config";
import { WasmStore } from "@/stores/wasm";

// Mock Web Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage(data: any) {
    // Mock worker response
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: { type: 'success' } }));
    }
  }
}

// Mock IndexedDB
const indexedDB = {
  open: () => ({
    result: {
      transaction: () => ({
        objectStore: () => ({
          get: () => ({
            onsuccess: null,
            onerror: null,
          }),
          put: () => ({
            onsuccess: null,
            onerror: null,
          }),
        }),
      }),
      createObjectStore: () => ({}),
    },
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
  }),
};

// Mock WASM store
vi.mock("@/stores/wasm", () => {
  return {
    WasmStore: class MockWasmStore {
      async getMpcEcdsaWasm() {
        return {
          createSigners: () => [{
            partial: () => ({
              scalar: Buffer.alloc(32),
            }),
          }],
        };
      }
      async getEciesWasm() {
        return {
          encrypt: vi.fn(),
          decrypt: vi.fn(),
        };
      }
    },
  };
});

// Add mocks to global
(global as any).Worker = MockWorker;
(global as any).indexedDB = indexedDB;

// Initialize root store with mock config
const mockConfig: Config = {
  chains: {
    enabled: [SecretJsHomeChainId.MAINNET],
    default: SecretJsHomeChainId.MAINNET,
  },
  languages: {
    enabled: ["en"],
    default: "en",
  },
  features: {
    [Feature.AccountsTab]: true,
    [Feature.HealthChecks]: true,
    [Feature.NftTab]: true,
    [Feature.Recovery]: true,
    [Feature.Staking]: true,
    [Feature.BrandToggle]: true,
    [Feature.DemoMode]: true,
  },
  keys: {
    enabled: [KeyType.Passkey],
    required: [KeyType.Passkey],
    comingSoon: [],
  },
  ethereumBalances: false,
  headless: true,
};

createRootStore({ config: mockConfig });

export const testSuite = createTestSuite(({ test }) => {
  test("computeAddress produces valid Bitcoin address", async () => {
    const wallet = MpcWallet.create(MOCK_WALLET_DATA);
    invariant(wallet.owner.primaryKey, "Primary key should be set");

    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const signer = await targetChain.mpcSigner(wallet);

    const publicKey = wallet.owner.primaryKey.publicKey;
    const address = targetChain.computeAddress(publicKey);
    const isValid = targetChain.validateAddress(address);

    expect(isValid).toBe(true);
  });

  test("signMessage signs message correctly", async () => {
    const wallet = MpcWallet.create(MOCK_WALLET_DATA);
    invariant(wallet.owner.primaryKey, "Primary key should be set");

    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const signer = await targetChain.mpcSigner(wallet);

    const message = "Test message";
    const messageHash = bitcoinMessage.magicHash(message);

    // Simulate MPC intentions payload and results
    const intentionsPayload = {
      signHashes: [messageHash],
      decryptMessages: [],
      decryptMultisigKeyEncryptedMessages: [],
    } as unknown as IntentionsPayload;

    const signature = await new Secp256k1PrivateKeySigner(
      wallet.owner.primaryKey.payload.privateKey
    ).signHash(messageHash);

    const results = new Map();
    results.set(wallet.owner.primaryKey.publicKey.value, {
      signedHashes: [signature],
      decryptedMessages: [],
      decryptedShares: [],
    });

    signer.addIntentionsResults({
      payload: intentionsPayload,
      results: results as IntentionsResults,
    });

    const signedMessage = await signer.signMessage(message);

    // Verify the signature
    const isValid = signer.verifyMessage(signedMessage, message);
    expect(isValid).toBe(true);
  });

  test("signTransaction constructs and signs transaction", async () => {
    const wallet = MpcWallet.create(MOCK_WALLET_DATA);
    invariant(wallet.owner.primaryKey, "Primary key should be set");

    const targetChain = TargetChain.chainId(BitcoinChainId.Testnet);
    const signer = await targetChain.mpcSigner(wallet);

    const psbt = new bitcoinjs.Psbt({ network: bitcoinjs.networks.testnet });

    // Create a dummy transaction with proper hash length
    const prevTx = new bitcoinjs.Transaction();
    prevTx.version = 1;
    prevTx.addInput(Buffer.alloc(32, 1), 0); // Add a dummy input to generate a valid hash
    prevTx.addOutput(
      bitcoinjs.address.toOutputScript(
        await signer.getAddress(),
        bitcoinjs.networks.testnet
      ),
      200000n
    );

    const prevTxHex = prevTx.toHex();
    const txid = prevTx.getId();

    // Add input with proper script
    // Convert base64 public key to hex buffer
    const pubkeyBase64 = wallet.owner.primaryKey.publicKey.value;
    const pubkey = Buffer.from(pubkeyBase64, 'base64');
    
    const p2wpkh = bitcoinjs.payments.p2wpkh({ 
      pubkey, 
      network: bitcoinjs.networks.testnet 
    });

    psbt.addInput({
      hash: txid,
      index: 0,
      witnessUtxo: {
        script: p2wpkh.output!,
        value: 200000n,
      },
    });

    psbt.addOutput({
      address: 'tb1qlw09ycnp3qgqw9alqgx93ed7cg5kmnyud326ky',
      value: 90000n,
    });

    // Add change output back to ourselves
    psbt.addOutput({
      address: await signer.getAddress(),
      value: 100000n - 90000n - 1000n,
    });

    // Extract the transaction for hash computation
    const tx = psbt.extractTransaction(false);
    const hashToSign = tx.hashForSignature(
      0,
      p2wpkh.output!,
      bitcoinjs.Transaction.SIGHASH_ALL
    );

    // Simulate MPC intentions payload and results
    const intentionsPayload = {
      signHashes: [hashToSign],
      decryptMessages: [],
      decryptMultisigKeyEncryptedMessages: [],
    } as unknown as IntentionsPayload;

    const signature = await new Secp256k1PrivateKeySigner(
      wallet.owner.primaryKey.payload.privateKey
    ).signHash(hashToSign);

    const results = new Map();
    results.set(wallet.owner.primaryKey.publicKey.value, {
      signedHashes: [signature],
      decryptedMessages: [],
      decryptedShares: [],
    });

    signer.addIntentionsResults({
      payload: intentionsPayload,
      results: results as IntentionsResults,
    });

    // Sign the transaction
    const signedPsbtBase64 = await signer.signTransaction(psbt.toBase64());
    
    // Parse and finalize the signed PSBT
    const signedPsbt = bitcoinjs.Psbt.fromBase64(signedPsbtBase64);
    signedPsbt.finalizeAllInputs();
    
    // Extract the final transaction
    const finalTx = signedPsbt.extractTransaction();
    expect(finalTx).toBeDefined();
    expect(finalTx.ins).toHaveLength(1);
    expect(finalTx.outs).toHaveLength(2);
  });
});