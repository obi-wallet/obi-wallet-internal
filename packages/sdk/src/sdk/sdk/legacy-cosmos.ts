// import { AbstractSdk } from "./abstract";
// import { LegacyCosmosChainId } from "../../chains";
// import { CosmJsClient } from "../../clients";
// import { LegacyCosmosBankSdk } from "../bank";
// import { CosmJsContractsSdk } from "../contracts";
// import { NotImplementedGatekeeperSdk } from "../gatekeeper";
// import { CosmJsStakingSdk } from "../staking";
// import { CosmJsTransactionsSdk } from "../transactions";

// export class LegacyCosmosSdk extends AbstractSdk {
//   public bank: LegacyCosmosBankSdk;
//   public contracts: CosmJsContractsSdk;
//   public gatekeeper: NotImplementedGatekeeperSdk;
//   public staking: CosmJsStakingSdk;
//   public transactions: CosmJsTransactionsSdk;

//   protected constructor(protected override chainId: LegacyCosmosChainId) {
//     super(chainId);
//     const client = new CosmJsClient(chainId);
//     this.bank = new LegacyCosmosBankSdk({
//       chainId,
//       client,
//     });
//     this.contracts = new CosmJsContractsSdk({
//       chainId,
//       client,
//     });
//     this.gatekeeper = new NotImplementedGatekeeperSdk(chainId);
//     this.staking = new CosmJsStakingSdk({
//       chainId,
//       client,
//     });
//     this.transactions = new CosmJsTransactionsSdk({
//       chainId,
//       client,
//     });
//   }

//   public static chainId(chainId: LegacyCosmosChainId) {
//     return new LegacyCosmosSdk(chainId);
//   }
// }
