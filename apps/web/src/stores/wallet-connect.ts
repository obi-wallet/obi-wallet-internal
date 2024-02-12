import type Web3Wallet from "@walletconnect/web3wallet";

export class WalletConnectStore {
  protected web3Wallet: Web3Wallet | null = null;

  public async pair(uri: string) {
    // TODO: it seems we can only scan the QR code once.
    // If there isn't a follow-up session_proposal event,
    // the user has to refresh the QR code and scan again.
    const web3Wallet = await this.getWeb3Wallet();
    console.log("initiating pairing with", uri);
    console.log(web3Wallet.getPendingSessionRequests());
    await web3Wallet.pair({ uri });
    console.log(web3Wallet.getPendingSessionRequests());
  }

  protected async getWeb3Wallet() {
    if (!this.web3Wallet) {
      const { setupWalletConnect } = await import("@obi-wallet/wallet-connect");
      this.web3Wallet = await setupWalletConnect({
        projectId: "044348b5f9a15395896ca2661ad9ea10",
        metadata: {
          name: "foo",
          description: "foo",
          url: "foo",
          icons: [],
        },
      });
    }
    return this.web3Wallet;
  }
}
