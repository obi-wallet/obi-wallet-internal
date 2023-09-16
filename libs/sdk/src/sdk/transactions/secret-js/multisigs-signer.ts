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
import { Account } from "secretjs";

import { Chain, SecretJsChainId } from "../../../chains";
import { MultisigPublicKey } from "../../../keys";
import {
  MultisigSigner as AbstractMultisigSigner,
  Signer,
} from "../../../signers";
import { CosmJsOfflineAminoSigner } from "../../common/cosm-js";

const registry = new Registry([...defaultRegistryTypes, ...wasmTypes]);

export class SecretJsMultisigSigner extends AbstractMultisigSigner<Uint8Array> {
  protected chainId: SecretJsChainId;
  protected account: Account;
  protected sequence: number;
  protected fee: StdFee;
  protected signDoc: StdSignDoc;
  protected encodeObjects: EncodeObject[];
  protected key: MultisigThresholdPubkey;

  public constructor({
    chainId,
    account,
    accountNumber,
    sequence,
    fee,
    encodeObjects,
    messages,
    multisigPublicKey,
  }: {
    chainId: SecretJsChainId;
    account: Account;
    accountNumber: number;
    sequence: number;
    fee: StdFee;
    encodeObjects: EncodeObject[];
    messages: AminoMsg[];
    multisigPublicKey: MultisigPublicKey;
  }) {
    super(multisigPublicKey);
    this.chainId = chainId;
    this.account = account;
    this.sequence = sequence;
    this.fee = fee;
    this.encodeObjects = encodeObjects;
    this.key = createMultisigThresholdPubkey(
      multisigPublicKey.value.pubkeys,
      parseInt(multisigPublicKey.value.threshold, 10),
    );
    this.signDoc = {
      memo: "",
      account_number: accountNumber.toString(),
      chain_id: chainId,
      fee: fee,
      msgs: messages,
      sequence: sequence.toString(),
    };
  }

  protected get prefix() {
    return Chain.information(this.chainId).prefix;
  }

  protected async createSignature(signer: Signer) {
    const offlineAminoSigner = CosmJsOfflineAminoSigner.fromSigner({
      signer,
      prefix: this.prefix,
    });
    return await offlineAminoSigner.signStdSignDoc(this.signDoc);
  }

  protected unsafeCreateSignedTransaction() {
    const body: TxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: {
        messages: this.encodeObjects,
        memo: "",
      },
    };
    const bodyBytes = registry.encode(body);

    const signatures = new Map();
    for (const publicKey of this.key.value.pubkeys) {
      const signature = this.signatures.get(publicKey.value);
      if (signature) {
        signatures.set(pubkeyToAddress(publicKey, this.prefix), signature);
      }
    }

    const transaction = makeMultisignedTx(
      this.key,
      this.sequence,
      this.fee,
      bodyBytes,
      signatures,
    );

    return TxRaw.encode(transaction).finish();
  }
}
