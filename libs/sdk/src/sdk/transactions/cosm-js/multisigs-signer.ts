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
import {
  Account,
  defaultRegistryTypes,
  makeMultisignedTx,
} from "@cosmjs/stargate";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { Chain, CosmosChainId, LegacyCosmosChainId } from "../../../chains";
import { MultisigPublicKey } from "../../../keys";
import {
  MultisigSigner as AbstractMultisigSigner,
  Signer,
} from "../../../signers";
import { CosmJsOfflineAminoSigner } from "../../common/cosm-js";

const registry = new Registry([...defaultRegistryTypes, ...wasmTypes]);

export class CosmJsMultisigSigner extends AbstractMultisigSigner<Uint8Array> {
  protected chainId: CosmosChainId | LegacyCosmosChainId;
  protected account: Account;
  protected fee: StdFee;
  protected signDoc: StdSignDoc;
  protected encodeObjects: EncodeObject[];
  protected key: MultisigThresholdPubkey;

  public constructor({
    chainId,
    account,
    fee,
    encodeObjects,
    messages,
    multisigPublicKey,
  }: {
    chainId: CosmosChainId | LegacyCosmosChainId;
    account: Account;
    fee: StdFee;
    encodeObjects: EncodeObject[];
    messages: AminoMsg[];
    multisigPublicKey: MultisigPublicKey;
  }) {
    super(multisigPublicKey);
    this.chainId = chainId;
    this.account = account;
    this.fee = fee;
    this.encodeObjects = encodeObjects;
    this.key = createMultisigThresholdPubkey(
      multisigPublicKey.value.pubkeys,
      parseInt(multisigPublicKey.value.threshold, 10),
    );
    this.signDoc = {
      memo: "",
      account_number: account.accountNumber.toString(),
      chain_id: chainId,
      fee: fee,
      msgs: messages,
      sequence: account.sequence.toString(),
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

  protected unsafeCreateSignedTransactionOrMessage() {
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
      this.account.sequence,
      this.fee,
      bodyBytes,
      signatures,
    );

    return {
      signed: [TxRaw.encode(transaction).finish()],
      broadcast: true
    };
  }
}
