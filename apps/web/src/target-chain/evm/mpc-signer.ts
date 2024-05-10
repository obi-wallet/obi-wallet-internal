import { rootStore } from "@/hooks/use-create-root-store";
import { fetchPublicKey } from "@/hooks/use-public-key";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { EasyShareDecryption } from "@/lib/encryption";
import { TargetChain } from "@/target-chain";
import { EvmChainId } from "@/target-chain/evm/chains";
import { IntentionsResults } from "@/user-interactions/approve-intentions";
import { MpcWallet, Secp256k1PublicKey, SecretJsClient } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";
import {
  CustomSource,
  hashMessage,
  hashTypedData,
  keccak256,
  serializeSignature,
  serializeTransaction,
  Signature,
  TransactionSerializable,
} from "viem";
import { z } from "zod";

export class EvmMpcSigner {
  protected bytesSignedBySignersPerHash = new Map<string, string[]>();
  public lastHash: Uint8Array | undefined;

  protected constructor(
    protected wallet: MpcWallet,
    protected publicKey: Secp256k1PublicKey,
    protected targetChainId: EvmChainId,
  ) {}

  public static async fromWallet(
    wallet: MpcWallet,
    targetChainId: EvmChainId,
  ): Promise<EvmMpcSigner> {
    const publicKey = await fetchPublicKey(wallet);

    return new EvmMpcSigner(wallet, publicKey, targetChainId);
  }

  public addIntentionsResults({
    payload,
    results,
  }: {
    payload: IntentionsPayload;
    results: IntentionsResults;
  }) {
    payload.signHashes.forEach((hash, index) => {
      this.bytesSignedBySignersPerHash.set(
        Buffer.from(hash).toString("hex"),
        [...results.values()]
          .map((result) => {
            return result.signedHashes[index];
          })
          .filter((signedHash): signedHash is Uint8Array => {
            return !!signedHash;
          })
          .map((signedHash) => {
            return Buffer.from(signedHash).toString("hex");
          }),
      );
    });
  }

  public get accountSource(): CustomSource {
    return {
      address: TargetChain.chainId(this.targetChainId).computeAddress(
        this.publicKey,
      ),
      signMessage: async ({ message }) => {
        // see https://github.com/wevm/viem/blob/0fa08e113a890e6672fdc64fa7a2206a840611ab/src/accounts/utils/signMessage.ts#L35
        const hash = hashMessage(message);
        const signature = await this.signHash(
          Buffer.from(hash.slice(2), "hex"),
        );
        return serializeSignature(signature);
      },
      signTransaction: async (transaction, args) => {
        const serializer = args?.serializer ?? serializeTransaction;

        // see https://github.com/wevm/viem/blob/0fa08e113a890e6672fdc64fa7a2206a840611ab/src/accounts/utils/signTransaction.ts#L40
        const signableTransaction = ((): TransactionSerializable => {
          // For EIP-4844 Transactions, we want to sign the transaction payload body (tx_payload_body) without the sidecars (ie. without the network wrapper).
          // See: https://github.com/ethereum/EIPs/blob/e00f4daa66bd56e2dbd5f1d36d09fd613811a48b/EIPS/eip-4844.md#networking
          if (transaction.type === "eip4844") {
            return {
              ...transaction,
              sidecars: false,
            };
          }
          return transaction;
        })();

        const hash = keccak256(serializer(signableTransaction));

        const signature = await this.signHash(
          Buffer.from(hash.slice(2), "hex"),
        );
        return serializer(transaction, signature);
      },
      signTypedData: async (typedData) => {
        // see https://github.com/wevm/viem/blob/0fa08e113a890e6672fdc64fa7a2206a840611ab/src/accounts/utils/signTypedData.ts#L39
        const signature = await this.signHash(
          Buffer.from(hashTypedData(typedData).slice(2), "hex"),
        );
        return serializeSignature(signature);
      },
    };
  }

  protected async signHash(hash: Uint8Array): Promise<Signature> {
    this.lastHash = hash;
    if (this.wallet.encryptedEasyShare) {
      return await this.signHashWithEasyShare(hash);
    }

    throw new Error("No encrypted easy share found");
  }

  protected async signHashWithEasyShare(hash: Uint8Array): Promise<Signature> {
    invariant(rootStore.current, "Root store is not initialized");

    const bytes = Buffer.from(hash).toString("hex");
    const bytesSignedBySigners = this.bytesSignedBySignersPerHash.get(bytes);
    invariant(bytesSignedBySigners, "Hash has not been signed");

    const mpcPackage = await rootStore.current.wasmStore.getMpcEcdsaWasm();

    const primaryKey = this.wallet.owner.primaryKey;
    invariant(primaryKey, "No primary key found");

    const easyShare = await new EasyShareDecryption(this.wallet.owner).decrypt(
      this.wallet.encryptedEasyShare,
    );

    const signers = mpcPackage.createSigners([
      easyShare.preSignForNetworkShare,
    ]);

    const partialSignatures = signers.map((signer) => {
      return signer.partial(hash).scalar;
    });

    const client = new SecretJsClient(this.wallet.homeChainId);

    const userEntryCodeHash = await client.withSecretNetworkClient(
      async (secretNetworkClient) => {
        const info = await secretNetworkClient.query.compute.contractInfo({
          contract_address: this.wallet.userEntryAddress,
        });
        const response =
          await secretNetworkClient.query.compute.codeHashByCodeId({
            code_id: info.contract_info?.code_id,
          });
        return response.code_hash;
      },
    );

    const schema = z.object({
      r: z.string(),
      s: z.string(),
      recid: z.literal(0).or(z.literal(1)),
    });
    const response = await client.queryContract({
      contract: this.wallet.homeChain.secretSigner.address,
      codeHash: this.wallet.homeChain.secretSigner.codeHash,
      query: {
        sign_bytes: {
          participants: [1, 3],
          user_entry_address: this.wallet.userEntryAddress,
          user_entry_code_hash: userEntryCodeHash,
          other_partial_sigs: partialSignatures,
          prepend: false,
          is_already_hashed: true,
          bytes,
          bytes_signed_by_signers: bytesSignedBySigners,
        },
      },
      schema,
    });
    return {
      r: `0x${response.r}`,
      s: `0x${response.s}`,
      yParity: response.recid,
    };
  }
}
