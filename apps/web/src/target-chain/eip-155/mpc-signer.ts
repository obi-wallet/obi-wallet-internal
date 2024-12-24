import { HomeChain } from "@/home-chain";
import { TargetChain } from "@/target-chain";
import { Eip155ChainId } from "@/target-chain/eip-155/chains";
import { MpcSigner } from "@/target-chain/mpc-signer";
import { Encoding, HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import { MpcWallet, Secp256k1PublicKey } from "@obi-wallet/sdk";
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

export class Eip155MpcSigner {
  public readonly mpcSigner: MpcSigner;

  protected constructor(
    protected wallet: MpcWallet,
    protected publicKey: Secp256k1PublicKey,
    protected targetChainId: Eip155ChainId,
  ) {
    this.mpcSigner = new MpcSigner(wallet);
  }

  public static async fromWallet(
    wallet: MpcWallet,
    targetChainId: Eip155ChainId,
  ): Promise<Eip155MpcSigner> {
    const publicKey = await HomeChain.chainId(
      wallet.homeChainId,
    ).secp256k1PublicKey(wallet);

    return new Eip155MpcSigner(wallet, publicKey, targetChainId);
  }

  public get accountSource(): CustomSource {
    return {
      address: TargetChain.chainId(this.targetChainId).computeAddress(
        this.publicKey,
      ),
      signMessage: async ({ message }) => {
        // see https://github.com/wevm/viem/blob/0fa08e113a890e6672fdc64fa7a2206a840611ab/src/accounts/utils/signMessage.ts#L35
        const signature = await this.signHash(
          HexEncodedStringWithPrefix.parse(hashMessage(message)),
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

        const signature = await this.signHash(
          HexEncodedStringWithPrefix.parse(
            keccak256(serializer(signableTransaction)),
          ),
        );
        return serializer(transaction, signature);
      },
      signTypedData: async (typedData) => {
        // see https://github.com/wevm/viem/blob/0fa08e113a890e6672fdc64fa7a2206a840611ab/src/accounts/utils/signTypedData.ts#L39
        const signature = await this.signHash(
          HexEncodedStringWithPrefix.parse(hashTypedData(typedData)),
        );
        return serializeSignature(signature);
      },
    };
  }

  protected async signHash(
    hash: HexEncodedStringWithPrefix,
  ): Promise<Signature> {
    const hashU8 = Encoding.fromPrefixedHex(hash).toBytes();
    const signature = await this.mpcSigner.signHash(hashU8);
    return {
      r: Encoding.fromHex(signature.r).toPrefixedHex(),
      s: Encoding.fromHex(signature.s).toPrefixedHex(),
      yParity: signature.recid,
    };
  }
}
