import { HomeChain } from "@/home-chain";
import { rootStore } from "@/stores";
import { TargetChain } from "@/target-chain";
import { isEip155ChainId } from "@/target-chain/eip-155/chains";
import { isSolanaChainId } from "@/target-chain/solana/chains";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import {
  Caip19AssetId,
  Caip2ChainId,
  parseCaip19AssetId,
} from "@obi-wallet/sdk-caip";

export type WalletProvidersResponse =
  | {
      success: true;
      address: string;
    }
  | {
      success: false;
      error: string;
    };

export class WalletProviders {
  public constructor(protected readonly to: Caip19AssetId) {}

  public async connectPhantom(): Promise<WalletProvidersResponse> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const phantomWindow = window as unknown as {
      phantom?: {
        solana?: {
          isPhantom: boolean;
          connect: () => Promise<{
            publicKey: {
              toString: () => string;
            };
          }>;
        };
        ethereum?: {
          isPhantom: boolean;
          request: (args: {
            method: "eth_requestAccounts";
          }) => Promise<string[]>;
        };
      };
    };

    if (!("phantom" in phantomWindow)) {
      return {
        success: false,
        error: "Phantom not found",
      };
    }

    if (isSolanaChainId(this.toChainId)) {
      const provider = phantomWindow.phantom.solana;

      if (!provider?.isPhantom) {
        return {
          success: false,
          error: "Phantom not found",
        };
      }

      try {
        const resp = await provider.connect();
        const address = resp.publicKey.toString();

        if (!this.targetChain.validateAddress(address)) {
          return {
            success: false,
            error: `Invalid address: ${address}`,
          };
        }

        return {
          success: true,
          address,
        };
      } catch (e) {
        const error = e instanceof Error ? e.message : "Unknown error";
        return {
          success: false,
          error: `Failed to connect to Phantom: ${error}`,
        };
      }
    }

    if (isEip155ChainId(this.toChainId)) {
      const provider = phantomWindow.phantom.ethereum;

      if (!provider?.isPhantom) {
        return {
          success: false,
          error: "Phantom not found",
        };
      }

      try {
        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];

        if (!address) {
          return {
            success: false,
            error: "No accounts found",
          };
        }

        if (!this.targetChain.validateAddress(address)) {
          return {
            success: false,
            error: `Invalid address: ${address}`,
          };
        }

        return {
          success: true,
          address,
        };
      } catch (e) {
        const error = e instanceof Error ? e.message : "Unknown error";
        return {
          success: false,
          error: `Failed to connect to Phantom: ${error}`,
        };
      }
    }

    return {
      success: false,
      error: "Target chain is not supported by Phantom",
    };
  }

  public async connectObi(): Promise<WalletProvidersResponse> {
    const currentWallet = rootStore.current?.mpcWalletsStore.currentWallet;

    if (!currentWallet) {
      return {
        success: false,
        error: "No wallet found",
      };
    }

    const publicKeys = await HomeChain.chainId(
      currentWallet.homeChainId,
    ).publicKeys(currentWallet);
    const address = await TargetChain.chainId(this.toChainId).obiAccountAddress(
      publicKeys,
    );

    return {
      success: true,
      address,
    };
  }

  public get targetChain(): AbstractTargetChain<string, string> {
    return TargetChain.chainId(this.toChainId);
  }

  protected get toChainId(): Caip2ChainId {
    return parseCaip19AssetId(this.to).chainId;
  }
}
