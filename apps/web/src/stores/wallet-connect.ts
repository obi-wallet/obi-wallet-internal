import { HomeChain } from "@/home-chain";
import { allTargetChainIds, TargetChain } from "@/target-chain";
import {
  CosmosSdkChainId,
  isCosmosSdkChainId,
} from "@/target-chain/cosmos-sdk/chains";
import { EvmChainId, EvmChains, isEvmChainId } from "@/target-chain/evm/chains";
import { SignAndBroadcastEvm } from "@/user-interactions/sign-and-broadcast/evm";
import { HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import { MpcWallets } from "@obi-wallet/sdk";
import { EthSendTransactionPayload } from "@obi-wallet/wallet-connect";
import { getSdkError } from "@walletconnect/utils";
import type Web3Wallet from "@walletconnect/web3wallet";
import invariant from "tiny-invariant";
import { hexToBigInt } from "viem";

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
        getWalletMeta: () => {
          const wallet = this.walletsStore.currentWallet;
          invariant(wallet, "Wallet not found");
          return {
            userEntryAddress: wallet.userEntryAddress,
          };
        },
        ethSendTransaction: this.ethSendTransaction.bind(this),
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
    const enabledCosmosSdkChains = allTargetChainIds.filter(
      (targetChainId): targetChainId is CosmosSdkChainId => {
        return (
          isCosmosSdkChainId(targetChainId) &&
          !TargetChain.chainId(targetChainId).disabled
        );
      },
    );
    const enabledEvmChains = allTargetChainIds.filter(
      (targetChainId): targetChainId is EvmChainId => {
        return (
          isEvmChainId(targetChainId) &&
          !TargetChain.chainId(targetChainId).disabled
        );
      },
    );

    return await Promise.all([
      ...enabledCosmosSdkChains.map(async (targetChainId) => {
        const targetChain = TargetChain.chainId(targetChainId);
        return {
          namespace: "cosmos",
          chainId: targetChainId,
          address: await targetChain.obiAccountAddress(publicKey),
          publicKey,
        };
      }),
      ...enabledEvmChains.map(async (targetChainId) => {
        const targetChain = TargetChain.chainId(targetChainId);
        return {
          namespace: "eip155",
          chainId: `${targetChain.evmChainId}`,
          address: await targetChain.obiAccountAddress(publicKey),
          publicKey,
        };
      }),
    ]);
  }

  protected async ethSendTransaction(
    payload: EthSendTransactionPayload,
  ): Promise<
    { approved: true; txHash: HexEncodedStringWithPrefix } | { approved: false }
  > {
    console.log("ethSendTransaction", payload);
    const targetChainId = Object.values(EvmChains).find((chain) => {
      return chain.chain.id === payload.chainId;
    })?.id;
    invariant(targetChainId, "Target chain not found");

    const targetChain = TargetChain.chainId(targetChainId);
    const wallet = this.walletsStore.currentWallet;
    invariant(wallet, "Wallet not found");

    const account = await targetChain.localAccountFromWallet(wallet);
    const kernelAccount = await targetChain.kernelAccount(account);
    const callData = HexEncodedStringWithPrefix.parse(
      await kernelAccount.encodeCallData({
        to: payload.to,
        data: payload.data,
        value: hexToBigInt(payload.value),
      }),
    );
    const response = await SignAndBroadcastEvm.start({
      callData,
      cancelable: true,
      targetChainId,
      walletMeta: {
        userEntryAddress: wallet.userEntryAddress,
      },
    });
    if (response.approved) {
      const receipt = await targetChain.waitForUserOperationReceipt(
        response.hash,
      );
      console.log(receipt);
      return {
        approved: true,
        txHash: receipt.txHash,
      };
    } else {
      return {
        approved: false,
      };
    }
  }
}
