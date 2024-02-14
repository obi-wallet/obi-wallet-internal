import { newFetchPublicKey } from "@/hooks/use-public-key";
import { TargetChain } from "@/target-chain";
import { CosmosSdkChains } from "@/target-chain/cosmos-sdk/chains";
import { MpcWallets } from "@obi-wallet/sdk";
import { getSdkError } from "@walletconnect/utils";
import type Web3Wallet from "@walletconnect/web3wallet";
import invariant from "tiny-invariant";

export class WalletConnectStore {
  protected readonly walletsStore: MpcWallets;
  protected web3Wallet: Web3Wallet | null = null;

  public constructor({ walletsStore }: { walletsStore: MpcWallets }) {
    this.walletsStore = walletsStore;
    setTimeout(() => {
      this.getAccounts().then((accounts) => {
        console.log(accounts);
      });
    }, 1000);
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
      });
    }
    return this.web3Wallet;
  }

  protected async getAccounts() {
    const wallet = this.walletsStore.currentWallet;
    invariant(wallet, "Wallet not found");
    const publicKey = await newFetchPublicKey(wallet);
    const enabledCosmosSdkChains = Object.values(CosmosSdkChains).filter(
      (chain) => {
        return !chain.disabled;
      },
    );
    return enabledCosmosSdkChains.map((chain) => {
      const targetChain = TargetChain.chainId(chain.id);
      return {
        namespace: "cosmos",
        chainId: chain.id,
        address: targetChain.computeAddress(publicKey),
        publicKey,
      };
    });
  }
}
