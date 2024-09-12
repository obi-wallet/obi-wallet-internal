import { TargetChain } from "@/target-chain";
import { MpcWallets } from "@obi-wallet/sdk";
import {
  SessionRequestPayload,
  SessionRequestResponse,
} from "@obi-wallet/wallet-connect";
import { getSdkError } from "@walletconnect/utils";
import type Web3Wallet from "@walletconnect/web3wallet";
import { action, autorun, observable } from "mobx";

export class WalletConnectStore {
  @observable protected accessor queuedUri: string | null = null;

  protected readonly walletsStore: MpcWallets;
  protected web3Wallet: Web3Wallet | null = null;

  public constructor({ walletsStore }: { walletsStore: MpcWallets }) {
    this.walletsStore = walletsStore;

    // Make sure we set up WalletConnect on all pages
    void this.getActiveSessions();

    autorun(async () => {
      if (this.queuedUri && this.walletsStore.currentWallet) {
        await this.pair(this.queuedUri);
        this.queuedUri = null;
      }
    });
  }

  @action
  public queueUri(uri: string) {
    this.queuedUri = uri;
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
        getSupportedNamespaces:
          TargetChain.getSupportedWalletConnectNamespaces.bind(TargetChain),
        handleSessionRequest: this.handleSessionRequest.bind(this),
      });
    }
    return this.web3Wallet;
  }

  protected async handleSessionRequest(
    payload: SessionRequestPayload,
  ): Promise<SessionRequestResponse> {
    const targetChain = TargetChain.chainId(payload.chainId);
    return await targetChain.handleWalletConnectSessionRequest(payload);
  }
}
