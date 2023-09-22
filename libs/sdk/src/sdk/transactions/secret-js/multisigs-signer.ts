import {
  AminoMsg,
  createMultisigThresholdPubkey,
  MultisigThresholdPubkey,
  pubkeyToAddress,
  StdFee,
  StdSignDoc,
} from "@cosmjs/amino";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate/build/modules";
import {
  EncodeObject,
  Registry,
  TxBodyEncodeObject,
} from "@cosmjs/proto-signing";
import { defaultRegistryTypes, makeMultisignedTx } from "@cosmjs/stargate";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Interface, InterfaceAbi } from "ethers";
import { Account } from "secretjs";
import invariant from "tiny-invariant";

import { Chain, SecretJsChainId } from "../../../chains";
import { MultisigPublicKey } from "../../../keys";
import {
  MultisigSigner as AbstractMultisigSigner,
  Signer,
} from "../../../signers";
import { CosmJsOfflineAminoSigner } from "../../common/cosm-js";

const registry = new Registry([...defaultRegistryTypes, ...wasmTypes]);

type EthTxInput = {
  abi: InterfaceAbi;
  contractAddress: string;
  functionName: string;
  params: unknown[];
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

export class EthTransaction {
  abi: InterfaceAbi;
  contractAddress: string;
  functionName: string;
  params: unknown[];
  tokens: {
    accessToken: string;
    refreshToken: string;
  };

  constructor(input: EthTxInput) {
    this.abi = input.abi;
    this.contractAddress = input.contractAddress;
    this.functionName = input.functionName;
    this.params = input.params;
    this.tokens = input.tokens;
  }

  getEncodedCallData(): string {
    const contractInterface = new Interface(this.abi);

    // Ensure the function exists in the ABI
    if (!contractInterface.getFunction(this.functionName)) {
      throw new Error(
        `Function ${this.functionName} does not exist in the provided ABI.`,
      );
    }

    return contractInterface.encodeFunctionData(this.functionName, this.params);
  }
}

export class SecretJsMultisigSigner extends AbstractMultisigSigner<Uint8Array> {
  protected chainId: SecretJsChainId;
  protected account: Account;
  protected fee: StdFee;
  protected signDoc: StdSignDoc | undefined;
  protected signHash: string | undefined;
  protected signMessage: string | undefined;
  protected signUserOpInput: EthTxInput | undefined;
  protected encodeObjects: EncodeObject[] | undefined;
  protected key: MultisigThresholdPubkey;
  protected multisigPublicKey: MultisigPublicKey;

  public constructor({
    chainId,
    account,
    fee,
    encodeObjects,
    messages,
    multisigPublicKey,
  }: {
    chainId: SecretJsChainId;
    account: Account;
    fee: StdFee;
    encodeObjects: EncodeObject[] | undefined;
    messages: AminoMsg[];
    multisigPublicKey: MultisigPublicKey;
  }) {
    super(multisigPublicKey);
    this.chainId = chainId;
    this.account = account;
    this.fee = fee;
    this.encodeObjects = encodeObjects;
    this.multisigPublicKey = multisigPublicKey;
    this.key = createMultisigThresholdPubkey(
      multisigPublicKey.value.pubkeys,
      parseInt(multisigPublicKey.value.threshold, 10),
    );
    this.signMessage = undefined;
    this.signHash = undefined;
    const { type, value } = messages[0];

    if (["raw", "eth", "hash"].includes(type)) {
      console.log(
        `messages[0] ${type} passes with messages ${JSON.stringify({
          type,
          value,
        })}`,
      );

      switch (type) {
        case "raw":
          this.signMessage = value;
          break;
        case "hash":
          this.signHash = value;
          break;
        case "eth":
          console.log(`setting signUserOpInput to ${JSON.stringify(value)}`);
          this.signUserOpInput = value as EthTxInput;
          break;
      }
      this.signDoc = undefined;
    } else {
      this.signDoc = {
        memo: "",
        account_number: "", // accountNumber.toString(),
        chain_id: chainId,
        fee: fee,
        msgs: messages,
        sequence: "", // sequence.toString(),
      };
      this.signMessage = undefined;
    }
  }

  public getSignHash() {
    return this.signHash;
  }

  public getSignMessage() {
    return this.signMessage;
  }

  public getSignUserOpInput() {
    return this.signUserOpInput;
  }

  protected get prefix() {
    return Chain.information(this.chainId).prefix;
  }

  protected async createSignature(signer: Signer) {
    const offlineAminoSigner = CosmJsOfflineAminoSigner.fromSigner({
      signer,
      prefix: this.prefix,
    });
    if (this.signDoc) {
      return await offlineAminoSigner.signStdSignDoc(this.signDoc);
    } else if (this.signHash) {
      return await offlineAminoSigner.signMessage(
        Buffer.from(this.signHash!),
      );
    } else {
      invariant(this.signMessage, "signMessage must be defined");
      return await offlineAminoSigner.signMessage(
        Buffer.from(this.signMessage!),
      );
    }
  }

  /*
  protected async querySignMessage(multisigPubkey: string, message: string | Uint8Array): Promise<string> {
    const messageToSign =
      typeof message === "string"
        ? Buffer.from(message, "utf-8")
        : Buffer.from(message);
    console.log({ messageToSign: messageToSign.toString("hex") });
    const chain = secretJsChains["secret-4"];

    // here we'll need to start an interaction
    type MsgQuerySign = {
      sign_bytes: {
        user_public_key: string;
        bytes: string;
        bytes_signed_by_upk: string;
      };
    }
    const signed = Buffer.from("todo", "base64");
    const querySignBytesMsg: QueryContractRequest<MsgQuerySign> =  {
      contract_address: chain.secretSigner.address,
      code_hash: chain.secretSigner.codeHash,
      query: { sign_bytes: {
        user_public_key: Buffer.from(multisigPubkey, "base64").toString(
          "hex",
        ),
        bytes: messageToSign.toString("hex"),
        bytes_signed_by_upk: signed.toString("hex"),
      }},
    };

    return await this.client.withSecretNetworkClient(async (client) => {
      let bufferSource;
      if (!this.homeChain.zAuthKeyPair.publicKey) {
        bufferSource = this.deviceKeySigner?.publicKey.value;
      } else {
        bufferSource = this.homeChain.zAuthKeyPair.publicKey.value;
      }
      invariant(bufferSource, "Public key unavailable");
      console.log(
        JSON.stringify(
          {
            sign_bytes: {
              user_public_key: Buffer.from(bufferSource, "base64").toString(
                "hex",
              ),
              bytes: messageToSign.toString("hex"),
              bytes_signed_by_upk: signed.toString("hex"),
            },
          },
          null,
          2,
        ),
      );

      const response = (await client.query.compute.queryContract({
        contract_address: this.chainData.secretSigner.address,
        code_hash: this.chainData.secretSigner.codeHash,
        query: {
         
        },
      })) as { plain_signature: string; signature: string };
      return response.signature;
    });
  }
  */

  protected unsafeCreateSignedTransactionOrMessage() {
    const signatures = new Map();
    for (const publicKey of this.key.value.pubkeys) {
      const signature = this.signatures.get(publicKey.value);
      if (signature) {
        signatures.set(pubkeyToAddress(publicKey, this.prefix), signature);
      }
    }

    // if we're signing a native tx...
    if (this.encodeObjects) {
      const body: TxBodyEncodeObject = {
        typeUrl: "/cosmos.tx.v1beta1.TxBody",
        value: {
          messages: this.encodeObjects!,
          memo: "",
        },
      };
      const bodyBytes = registry.encode(body);

      const transaction = makeMultisignedTx(
        this.key,
        0, //this.sequence,
        this.fee,
        bodyBytes,
        signatures,
      );

      return {
        signed: [TxRaw.encode(transaction).finish()],
        broadcast: true,
      };
    } else {
      // otherwise we're signing a message
      const signaturesList = new Array<Uint8Array>();
      for (let i = 0; i < this.key.value.pubkeys.length; i++) {
        const signerAddress = pubkeyToAddress(
          this.key.value.pubkeys[i],
          "secret",
        );
        const signature = signatures.get(signerAddress);
        if (signature) {
          signaturesList.push(signature);
        }
      }
      console.log("Partial signatures: " + JSON.stringify(signaturesList));
      /* const finalSig = MultiSignature.encode(MultiSignature.fromPartial({ signatures: signaturesList })).finish();
      console.log("Final signature: " + JSON.stringify(finalSig));
      return {
        signed: finalSig,
        broadcast: false
      }; */
      return {
        signed: signaturesList,
        broadcast: false,
      };
    }
  }
}
