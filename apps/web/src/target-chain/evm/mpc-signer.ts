import { fetchPublicKey } from "@/hooks/use-public-key";
import { TargetChain } from "@/target-chain";
import { EvmChainId } from "@/target-chain/evm/chains";
import { MpcSigner } from "@/target-chain/mpc-signer";
import { MpcWallet, Secp256k1PublicKey } from "@obi-wallet/sdk";
import {
  CustomSource,
  hashMessage,
  hashTypedData,
  Hex,
  keccak256,
  serializeSignature,
  serializeTransaction,
  Signature,
  TransactionSerializable,
} from "viem";

export class EvmMpcSigner {
  public readonly mpcSigner: MpcSigner;

  protected constructor(
    protected wallet: MpcWallet,
    protected publicKey: Secp256k1PublicKey,
    protected targetChainId: EvmChainId,
  ) {
    this.mpcSigner = new MpcSigner(wallet);
  }

  public static async fromWallet(
    wallet: MpcWallet,
    targetChainId: EvmChainId,
  ): Promise<EvmMpcSigner> {
    const publicKey = await fetchPublicKey(wallet);

    return new EvmMpcSigner(wallet, publicKey, targetChainId);
  }

  public get accountSource(): CustomSource {
    return {
      address: TargetChain.chainId(this.targetChainId).computeAddress(
        this.publicKey,
      ),
      signMessage: async ({ message }) => {
        // see https://github.com/wevm/viem/blob/0fa08e113a890e6672fdc64fa7a2206a840611ab/src/accounts/utils/signMessage.ts#L35
        const signature = await this.signHash(hashMessage(message));
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

        const signature = await this.signHash(
          keccak256(serializer(signableTransaction)),
        );
        return serializer(transaction, signature);
      },
      signTypedData: async (typedData) => {
        // see https://github.com/wevm/viem/blob/0fa08e113a890e6672fdc64fa7a2206a840611ab/src/accounts/utils/signTypedData.ts#L39
        const signature = await this.signHash(hashTypedData(typedData));
        return serializeSignature(signature);
      },
    };
  }

  protected async signHash(hash: Hex): Promise<Signature> {
    const hashU8 = new Uint8Array(Buffer.from(hash.slice(2), "hex"));
    const signature = await this.mpcSigner.signHash(hashU8);
    return {
      r: `0x${signature.r}`,
      s: `0x${signature.s}`,
      yParity: signature.recid,
    };
  }
}
