// import { Chain, CosmosChainId, LegacyCosmosChainId } from "../../../chains";
// import { CosmJsClient } from "../../../clients";
// import { EnrichedToken, Token } from "../../common";
// import { AbstractBankSdk } from "../abstract";

// export class CosmJsBankSdk extends AbstractBankSdk {
//   protected override chainId: CosmosChainId | LegacyCosmosChainId;
//   protected client: CosmJsClient;

//   public constructor({
//     chainId,
//     client,
//   }: {
//     chainId: CosmosChainId | LegacyCosmosChainId;
//     client: CosmJsClient;
//   }) {
//     super(chainId);
//     this.chainId = chainId;
//     this.client = client;
//   }

//   protected async balancesQueryFn(address: string): Promise<Token[]> {
//     return await this.client.withClients(async ({ stargateClient }) => {
//       return await fetchNativeBalances();

//       async function fetchNativeBalances() {
//         const coins = await stargateClient.getAllBalances(address);
//         return coins.map((coin) => {
//           return {
//             id: coin.denom,
//             rawAmount: coin.amount,
//           };
//         });
//       }
//     });
//   }

//   protected async pricesQueryFn(): Promise<Record<string, number>> {
//     return {};
//   }

//   protected override enrichTokenWithoutUsdValue(token: Token): EnrichedToken {
//     switch (token.id) {
//       case this.chain.denom: {
//         const digits = 6;
//         return {
//           ...token,
//           amount: parseInt(token.rawAmount, 10) / 10 ** digits,
//           contract: null,
//           icon: "https://app.osmosis.zone/_next/image?url=%2Ftokens%2Fosmo.svg&w=48&q=75",
//           denom: this.chain.denom.slice(1).toUpperCase(),
//           digits,
//           label: this.chain.denom.slice(1).toUpperCase(),
//           usdValue: null,
//         };
//       }
//       case "ibc/A8C2D23A1E6F95DA4E48BA349667E322BD7A6C996D8A4AAE8BA72E190F3D1477": {
//         const digits = 6;
//         return {
//           ...token,
//           amount: parseInt(token.rawAmount, 10) / 10 ** digits,
//           contract: null,
//           icon: "https://app.osmosis.zone/_next/image?url=%2Ftokens%2Fatom.svg&w=48&q=75",
//           denom: "ATOM",
//           digits,
//           label: "ATOM",
//           usdValue: null,
//         };
//       }
//       case "ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE": {
//         const digits = 6;
//         return {
//           ...token,
//           amount: parseInt(token.rawAmount, 10) / 10 ** digits,
//           contract: null,
//           icon: "https://app.osmosis.zone/_next/image?url=/tokens/usdc.svg&w=48&q=75",
//           denom: "USDC",
//           digits,
//           label: "USDC",
//           usdValue: 1,
//         };
//       }
//       default:
//         return super.enrichTokenWithoutUsdValue(token);
//     }
//   }

//   protected get chain() {
//     return Chain.information(this.chainId);
//   }
// }
