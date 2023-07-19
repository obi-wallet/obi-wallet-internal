import {
  Account,
  LegacyAminoMultisigPublicKey,
  MultiSignature,
  SignatureV2,
  SignDoc,
  Tx,
} from "@terra-money/feather.js";

import { TerraChainId } from "../../../chains";
import { MultisigPublicKey } from "../../../keys";
import {
  MultisigSigner as AbstractMultisigSigner,
  Signer,
} from "../../../signers";
import { FeatherJsKey } from "../../common/feather-js";

export class FeatherJsMultisigSigner extends AbstractMultisigSigner<SignatureV2> {
  protected account: Account;
  protected transaction: Tx;
  protected key: LegacyAminoMultisigPublicKey;
  protected signDoc: SignDoc;

  public constructor({
    chainId,
    account,
    transaction,
    multisigPublicKey,
  }: {
    chainId: TerraChainId;
    account: Account;
    transaction: Tx;
    multisigPublicKey: MultisigPublicKey;
  }) {
    super(multisigPublicKey);
    this.account = account;
    this.transaction = transaction;
    this.key = LegacyAminoMultisigPublicKey.fromAmino(multisigPublicKey);
    this.signDoc = new SignDoc(
      chainId,
      account.getAccountNumber(),
      account.getSequenceNumber(),
      transaction.auth_info,
      transaction.body,
    );
  }

  protected async createSignature(signer: Signer) {
    const key = FeatherJsKey.fromSigner(signer);
    return await key.createSignatureAmino(this.signDoc);
  }

  protected unsafeCreateSignedTransaction() {
    const multiSignature = new MultiSignature(this.key);
    multiSignature.appendSignatureV2s(this.orderedSignatures);
    this.transaction.appendSignatures([
      new SignatureV2(
        this.key,
        multiSignature.toSignatureDescriptor(),
        this.account.getSequenceNumber(),
      ),
    ]);
    return this.transaction.toBytes();
  }
}
