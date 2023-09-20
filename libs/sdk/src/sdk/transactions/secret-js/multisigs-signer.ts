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
import * as ethers5 from "ethers5";
import { Account } from "secretjs";
import invariant from "tiny-invariant";
import {
  Client,
  Presets,
  IUserOperation,
  UserOperationMiddlewareCtx,
} from "userop";

import { ExtendedWallet } from "./extended-ethers-signer";
import { Chain, SecretJsChainId } from "../../../chains";
import { WalletMeta } from "../../../data-structures";
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
    if (messages[0].type === "raw" || messages[0].type === "eth") {
      console.log(
        "messages[0] raw/eth passes with messages " +
          JSON.stringify(messages[0]),
      );
      if (messages[0].type === "raw") {
        this.signMessage = messages[0].value;
      } else {
        console.log(
          "setting signUserOpInput to " + JSON.stringify(messages[0].value),
        );
        this.signUserOpInput = messages[0].value as EthTxInput;
        // also need to initUserOperation
      }
      this.signDoc = undefined;
    } else {
      this.signDoc = {
        memo: "",
        account_number: "", // accountNumber.toString(),
        chain_id: chainId,
        fee: fee,
        msgs: messages,
        sequence: "" // sequence.toString(),
      };
      this.signMessage = undefined;
    }
  }

  public getSignMessage() {
    return this.signMessage;
  }

  public getSignUserOpInput() {
    return this.signUserOpInput;
  }

  // public async initUserOperation(
  //   evmSigningAddress: string,
  //   walletMeta: WalletMeta,
  // ) {
  //   console.log("setting up paymaster middleware...");
  //   const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
  //     "https://api.stackup.sh/v1/paymaster/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
  //     { type: "payg" },
  //   );
  //   console.log("setting up client...");
  //   const client = await Client.init(
  //     "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
  //   );
  //   invariant(evmSigningAddress, "no signing address provided");
  //   // This likely won't actually be used for network calls
  //   console.log("setting up dummy provider...");
  //   const dummyProvider = new ethers5.providers.JsonRpcProvider(
  //     "https://api.stackup.sh/v1/paymaster/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
  //   );
  //   console.log("setting up extendedSigner...");
  //   const extendedSigner = new ExtendedWallet(
  //     evmSigningAddress,
  //     walletMeta,
  //     dummyProvider,
  //   );
  //   console.log("building simpleAccount...");
  //   const simpleAccount = await Presets.Builder.SimpleAccount.init(
  //     extendedSigner,
  //     "https://api.stackup.sh/v1/paymaster/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
  //     { paymasterMiddleware },
  //   );

  //   const buildUserOperation = async () => {
  //     invariant(this.signUserOpInput, "no user op inputted");
  //     console.log("in buildUserOperation()");
  //     const ethTx = new EthTransaction(this.signUserOpInput!);
  //     const userOp: IUserOperation = await client.buildUserOperation(
  //       simpleAccount.execute(
  //         ethTx.contractAddress,
  //         0,
  //         ethTx.getEncodedCallData(),
  //       ),
  //     );
  //     // signer contract should automatically prepend here
  //     const ctx: UserOperationMiddlewareCtx = new UserOperationMiddlewareCtx(
  //       userOp,
  //       "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  //       421613,
  //     );
  //     this.signMessage = ctx.getUserOpHash();
  //     console.log("user op hash is: " + this.signMessage);

  //     /*
  //     const erc20 = new Contract(
  //       body.token.id,
  //       [
  //         // Read-Only Functions
  //         "function balanceOf(address owner) view returns (uint256)",
  //         "function decimals() view returns (uint8)",
  //         "function symbol() view returns (string)",

  //         // Authenticated Functions
  //         "function transfer(address to, uint amount) returns (bool)",
  //         "function approve(address spender, uint amount) returns (bool)",

  //         // Events
  //         "event Transfer(address indexed from, address indexed to, uint amount)",
  //       ] as const,
  //       provider,
  //     );
  //     return await client.buildUserOperation(
  //       simpleAccount.execute(
  //         await erc20.getAddress(),
  //         0,
  //         erc20.interface.encodeFunctionData("transfer", [body.to, amount]),
  //       ),
  //     );
  //     */
  //   };

  //   // todo: move this out to when button is clicked
  //   /* eslint-disable @typescript-eslint/no-unused-vars */
  //   async function handleUserOperation(userOperation: IUserOperation) {
  //     try {
  //       return await client.execUserOperation(userOperation);
  //     } catch (e) {
  //       // recovery bit workaround, as simple signer can't calculate it
  //       const signature = userOperation.signature as string;
  //       userOperation.signature = `${signature.substring(
  //         0,
  //         userOperation.signature.length - 2,
  //       )}1b`;
  //       return await client.execUserOperation(userOperation);
  //     }
  //   }

  //   try {
  //     console.log("building userOperation...");
  //     const builtUserOperation = await buildUserOperation();
  //     // const userOperation = await handleUserOperation(builtUserOperation);
  //     console.log("built userOp:", builtUserOperation);
  //     // const event = await userOperation.wait();
  //     // console.log("event", event);
  //   } catch (e) {
  //     console.log("error", e);
  //   }
  // }

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
