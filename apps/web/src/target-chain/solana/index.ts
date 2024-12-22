import { HomeChain } from "@/home-chain";
import { rootStore } from "@/stores";
import { filterMap } from "@/util/filter-map";
import {
  AbstractTargetChain,
  AssetInfo,
  Caip19Asset,
} from "@obi-wallet/sdk-abstract-target-chain";
import { AssetRegistry } from "@obi-wallet/sdk-asset-registry";
import { Caip19AssetId, parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import { ObiAccountPublicKeys } from "@obi-wallet/sdk-obi-account";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import {
  Key,
  SessionRequestPayload,
  SessionRequestResponse,
} from "@obi-wallet/wallet-connect";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey, SolanaJSONRPCError } from "@solana/web3.js";
import { getSdkError } from "@walletconnect/utils";
import invariant from "tiny-invariant";

import {
  allSolanaChains,
  SolanaChainData,
  SolanaChainId,
  SolanaChains,
} from "./chains";

export class SolanaTargetChain extends AbstractTargetChain<SolanaChainId> {
  protected readonly chainData: SolanaChainData;

  public constructor(chainId: SolanaChainId) {
    super(chainId);
    this.chainData = SolanaChains[chainId];
  }

  public get label() {
    return this.chainData.name;
  }

  public get image() {
    return "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";
  }

  public get disabled() {
    if (!rootStore.current?.mpcWalletsStore.currentWallet?.ed25519PublicKey) {
      return true;
    }
    return this.chainData.disabled ?? false;
  }

  public computeAddress(_publicKey: Secp256k1PublicKey): string {
    // TODO:
    throw new Error("Method computeAddress not implemented.");
  }

  protected async obiAccountAddressQueryFn(
    publicKeys: ObiAccountPublicKeys,
  ): Promise<string> {
    invariant(publicKeys.ed25519, "Ed25519 public key is required.");
    return publicKeys.ed25519.value;
  }

  public validateAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  public isNativeAsset(assetId: Caip19AssetId): boolean {
    return assetId === this.nativeCaip19AssetId;
  }

  public isTokenAsset(assetId: Caip19AssetId): boolean {
    const { chainId, namespace } = parseCaip19AssetId(assetId);
    return chainId === this.chainId && namespace === "token";
  }

  public async nativeBalancesQueryFn(address: string): Promise<Caip19Asset[]> {
    const publicKey = new PublicKey(address);
    const balance = await this.solanaConnection.getBalance(publicKey);
    return [
      {
        assetId: this.nativeCaip19AssetId,
        rawAmount: balance.toString(),
      },
    ];
  }

  public async tokenBalanceQueryFn({
    address,
    assetId,
  }: {
    address: string;
    assetId: Caip19AssetId;
  }) {
    const { namespace, reference } = parseCaip19AssetId(assetId);
    switch (namespace) {
      case "token": {
        const owner = new PublicKey(address);
        const mint = new PublicKey(reference);
        const programIds = await this.getTokenProgramIds(reference);
        invariant(programIds, "Unknown token program");

        const [tokenAccountAddress] = PublicKey.findProgramAddressSync(
          [
            owner.toBuffer(),
            programIds.tokenProgramId.toBuffer(),
            mint.toBuffer(),
          ],
          programIds.associatedTokenProgramId,
        );
        try {
          const balance =
            await this.solanaConnection.getTokenAccountBalance(
              tokenAccountAddress,
            );
          return balance.value.amount;
        } catch (e) {
          if (e instanceof SolanaJSONRPCError) {
            // Account not found
            if (e.code === -32602) {
              return "0";
            }
          }
          throw e;
        }
      }
    }

    return "0";
  }

  public async getTokenProgramIds(address: string) {
    const accountInfo = await this.solanaConnection.getParsedAccountInfo(
      new PublicKey(address),
    );
    const owner = accountInfo.value?.owner;

    if (owner?.equals(TOKEN_PROGRAM_ID)) {
      return {
        tokenProgramId: TOKEN_PROGRAM_ID,
        associatedTokenProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
      };
    } else if (owner?.equals(TOKEN_2022_PROGRAM_ID)) {
      return {
        tokenProgramId: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
      };
    }

    return null;
  }

  public async assetInfo(id: Caip19AssetId): Promise<AssetInfo | null> {
    const asset = await AssetRegistry.getInstance().byId(id);
    if (asset?.assetInfo) return asset.assetInfo;

    return null;
  }

  public denomToCaip19AssetId(_denom: string): Caip19AssetId | null {
    // TODO:
    throw new Error("Method denomToCaip19AssetId not implemented.");
  }

  public caip19AssetIdToDenom(_assetId: Caip19AssetId): string | null {
    // TODO:
    throw new Error("Method caip19AssetIdToDenom not implemented.");
  }

  public get solanaConnection() {
    return new Connection(this.chainData.endpoint, "confirmed");
  }

  public get nativeCaip19AssetId(): Caip19AssetId {
    return `${this.chainId}/native:${this.nativeAddress}`;
  }

  protected get nativeAddress() {
    return "So11111111111111111111111111111111111111112";
  }

  public static async getSupportedWalletConnectNamespaces() {
    const wallet = rootStore.current?.mpcWalletsStore.currentWallet;
    invariant(wallet, "Wallet not found");
    const publicKeys = await HomeChain.chainId(
      wallet.homeChainId,
    ).new__publicKeys(wallet);

    const solanaChains = allSolanaChains
      .map((targetChainId) => {
        return new SolanaTargetChain(targetChainId);
      })
      .filter((chain) => {
        return !chain.disabled;
      });

    const usableSolanaChains = await filterMap(
      async (chain) => {
        const address = await chain.obiAccountAddressQueryFn(publicKeys);
        return {
          chainId: chain.chainId,
          account: `${chain.chainId}:${address}`,
        };
      },
      solanaChains,
      { catchErrors: true },
    );

    return {
      solana: {
        chains: usableSolanaChains.map((chain) => {
          return chain.chainId;
        }),
        methods: [
          "solana_getAccounts",
          "solana_requestAccounts",
          // TODO:
          "solana_signMessage",
          // TODO:
          "solana_signTransaction",
          // TODO:
          "solana_signAllTransactions",
          // TODO:
          "solana_signAndSendTransaction",
        ],
        accounts: usableSolanaChains.map((chain) => {
          return chain.account;
        }),
        events: ["chainChanged", "accountsChanged"],
      },
    };
  }

  public static async getWalletConnectKeys(): Promise<Key[]> {
    return [];
  }

  public async handleWalletConnectSessionRequest({
    request,
    chainId,
  }: SessionRequestPayload): Promise<SessionRequestResponse> {
    const wallet = rootStore.current?.mpcWalletsStore.currentWallet;
    if (!wallet) {
      return { error: getSdkError("USER_DISCONNECTED") };
    }

    switch (request.method) {
      case "solana_getAccounts":
      case "solana_requestAccounts": {
        const publicKeys = await HomeChain.chainId(
          wallet.homeChainId,
        ).new__publicKeys(wallet);
        const solanaChains = allSolanaChains
          .map((targetChainId) => {
            return new SolanaTargetChain(targetChainId);
          })
          .filter((chain) => {
            return chain.chainId === chainId;
          })
          .filter((chain) => {
            return !chain.disabled;
          });

        const result = await filterMap(
          async (targetChain) => {
            return {
              pubkey: await targetChain.obiAccountAddress(publicKeys),
            };
          },
          solanaChains,
          { catchErrors: true },
        );
        return { result };
      }
      default:
        return { error: getSdkError("WC_METHOD_UNSUPPORTED") };
    }
  }
}
