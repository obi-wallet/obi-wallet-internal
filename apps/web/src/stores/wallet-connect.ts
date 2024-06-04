import { HomeChain } from "@/home-chain";
import { allTargetChainIds, TargetChain } from "@/target-chain";
import { CosmosChainId, isCosmosChainId } from "@/target-chain/cosmos/chains";
import { Eip155ChainId, isEip155ChainId } from "@/target-chain/eip-155/chains";
import { MpcWallets } from "@obi-wallet/sdk";
import {
  SessionRequestPayload,
  SessionRequestResponse,
} from "@obi-wallet/wallet-connect";
import { getSdkError } from "@walletconnect/utils";
import type Web3Wallet from "@walletconnect/web3wallet";
import invariant from "tiny-invariant";

export class WalletConnectStore {
  protected readonly walletsStore: MpcWallets;
  protected web3Wallet: Web3Wallet | null = null;

  public constructor({ walletsStore }: { walletsStore: MpcWallets }) {
    this.walletsStore = walletsStore;

    // Make sure we set up WalletConnect on all pages
    void this.getActiveSessions();
  }

  public async pair(uri: string) {
    // TODO: it seems we can only scan the QR code once.
    // If there isn't a follow-up session_proposal event,
    // the user has to refresh the QR code and scan again.
    const web3Wallet = await this.getWeb3Wallet();
    await web3Wallet.pair({ uri });
  }

  public async disconnect(topic: string) {
    const web3Wallet = await this.getWeb3Wallet();
    await web3Wallet.disconnectSession({
      topic,
      reason: getSdkError("USER_DISCONNECTED"),
    });
  }

  public async getActiveSessions() {
    const web3Wallet = await this.getWeb3Wallet();
    return web3Wallet.getActiveSessions();
  }

  protected async getWeb3Wallet() {
    if (!this.web3Wallet) {
      const { setupWalletConnect } = await import("@obi-wallet/wallet-connect");
      this.web3Wallet = await setupWalletConnect({
        projectId: "044348b5f9a15395896ca2661ad9ea10",
        metadata: {
          name: "Keplr",
          description: "",
          url: "",
          icons: [],
        },
        getAccounts: this.getAccounts.bind(this),
        handleSessionRequest: this.handleSessionRequest.bind(this),
      });
    }
    return this.web3Wallet;
  }

  protected async getAccounts() {
    const wallet = this.walletsStore.currentWallet;
    invariant(wallet, "Wallet not found");
    const publicKey = await HomeChain.chainId(wallet.homeChainId).publicKey(
      wallet.userEntryAddress,
    );
    const enabledCosmosChains = allTargetChainIds.filter(
      (targetChainId): targetChainId is CosmosChainId => {
        return (
          isCosmosChainId(targetChainId) &&
          !TargetChain.chainId(targetChainId).disabled
        );
      },
    );
    const enabledEip155Chains = allTargetChainIds.filter(
      (targetChainId): targetChainId is Eip155ChainId => {
        return (
          isEip155ChainId(targetChainId) &&
          !TargetChain.chainId(targetChainId).disabled
        );
      },
    );

    return await Promise.all([
      ...enabledCosmosChains.map(async (targetChainId) => {
        const targetChain = TargetChain.chainId(targetChainId);
        return {
          namespace: "cosmos",
          chainId: targetChain.cosmosChainId,
          address: await targetChain.obiAccountAddress(publicKey),
          publicKey,
        };
      }),
      ...enabledEip155Chains.map(async (targetChainId) => {
        const targetChain = TargetChain.chainId(targetChainId);
        return {
          namespace: "eip155",
          chainId: `${targetChain.eip155ChainId}`,
          address: await targetChain.obiAccountAddress(publicKey),
          publicKey,
        };
      }),
    ]);
  }

  protected async handleSessionRequest(
    payload: SessionRequestPayload,
  ): Promise<SessionRequestResponse> {
    const targetChain = TargetChain.chainId(payload.chainId);
    return await targetChain.handleWalletConnectSessionRequest(payload);
  }
}
