// import warning from "tiny-warning";

// import { LegacyCosmosChainId, legacyCosmosChains } from "../../../chains";
// import { CosmJsClient } from "../../../clients";
// import {
//   FlexAccount,
//   MultisigKey,
//   MultisigWallet,
// } from "../../../data-structures";
// import { Secp256k1PrivateKeySigner, Signer } from "../../../signers";
// import { Message, SignedTransaction } from "../../../transactions";
// import { BroadcastTransactionResult, CodeIds, Token } from "../../common";
// import { Messages } from "../../messages";
// import { Sdk } from "../../sdk";
// import {
//   AbstractMultisigWalletSdk,
//   UpdateGatekeeperConfigParams,
// } from "../abstract";

// function notImplemented(message: string) {
//   warning(false, message);
// }

// export class LegacyCosmosMultisigWalletSdk extends AbstractMultisigWalletSdk {
//   protected override chainId: LegacyCosmosChainId;
//   protected client: CosmJsClient;

//   public constructor({
//     chainId,
//     wallet,
//   }: {
//     chainId: LegacyCosmosChainId;
//     wallet: MultisigWallet;
//   }) {
//     super({ chainId, wallet });
//     this.chainId = chainId;
//     this.client = new CosmJsClient(chainId);
//   }
//   protected async codeIdsQueryFn(): Promise<CodeIds> {
//     return {
//       userAccount: await this.sdk.contracts.codeId(this.wallet.proxyAddress),
//       spendLimitGatekeeper: null,
//       debtGatekeeper: null,
//     };
//   }

//   protected async isOutdatedQueryFn(): Promise<boolean> {
//     const codeIds = await this.codeIds();
//     return codeIds.userAccount < this.chain.currentCodeId;
//   }

//   public async updateWallet(): Promise<
//     | {
//         approved: true;
//         payload: BroadcastTransactionResult | { success: true };
//       }
//     | { approved: false }
//   > {
//     notImplemented("updateWallet not implemented for Cosmos");
//     return { approved: false };
//   }

//   public async updateOwner(newOwner: MultisigKey, oldSigner: Secp256k1PrivateKeySigner, newSigner: Secp256k1PrivateKeySigner): Promise<
//     | {
//         approved: true;
//         payload: BroadcastTransactionResult | { success: true };
//       }
//     | { approved: false }
//   > {
//     notImplemented("updateOwner not implemented for Cosmos");
//     return { approved: false };
//   }

//   public async proposedOwner() {
//     notImplemented("proposedOwner not implemented for Cosmos");
//     return null;
//   }

//   public async updateGatekeeperConfig(_: UpdateGatekeeperConfigParams): Promise<
//     | {
//         approved: true;
//         payload: BroadcastTransactionResult | { success: true };
//       }
//     | { approved: false }
//   > {
//     notImplemented("updateGatekeeperConfig not implemented for Cosmos");
//     return { approved: false };
//   }

//   public async stake(_: {
//     amount: Token;
//     validator: string;
//   }): Promise<
//     | { approved: true; payload: BroadcastTransactionResult }
//     | { approved: false }
//   > {
//     notImplemented("stake not implemented for Cosmos");
//     return { approved: false };
//   }

//   public async unstake(_: {
//     amount: Token;
//     validator: string;
//   }): Promise<
//     | { approved: true; payload: BroadcastTransactionResult }
//     | { approved: false }
//   > {
//     notImplemented("unstake not implemented for Cosmos");
//     return { approved: false };
//   }

//   public async withdrawRewards(): Promise<
//     | { approved: true; payload: BroadcastTransactionResult }
//     | { approved: false }
//   > {
//     notImplemented("withdrawRewards not implemented for Cosmos");
//     return { approved: false };
//   }

//   public async canExecute(_: {
//     flexAccount: FlexAccount;
//     messages: Message[];
//   }): Promise<boolean> {
//     notImplemented("canExecute not implemented for Cosmos");
//     return false;
//   }

//   public async createAndSignTransaction({
//     signer,
//     messages,
//   }: {
//     signer: Signer;
//     messages: Message[];
//   }): Promise<SignedTransaction> {
//     return await this.client.createAndSignTransaction({ signer, messages });
//   }

//   public async broadcastSignedTransaction(
//     signedTransaction: SignedTransaction,
//   ): Promise<BroadcastTransactionResult> {
//     return await this.client.broadcastSignedTransaction(signedTransaction);
//   }

//   protected get chain() {
//     return legacyCosmosChains[this.chainId];
//   }

//   protected get messages() {
//     return Messages.chainId(this.chainId);
//   }

//   protected get sdk() {
//     return Sdk.chainId(this.chainId);
//   }
// }
