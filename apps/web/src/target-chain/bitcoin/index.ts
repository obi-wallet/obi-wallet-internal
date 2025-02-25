import {
  AbstractTargetChain,
  AssetInfo,
} from "@obi-wallet/sdk-abstract-target-chain";
import { Caip19AssetId, parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import { ObiAccountPublicKeys } from "@obi-wallet/sdk-obi-account";
import {
  getSecp256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import {
  SessionRequestPayload,
  SessionRequestResponse,
} from "@obi-wallet/wallet-connect";
import bitcoin from "bitcoinjs-lib";

import { BitcoinChainData, BitcoinChainId, BitcoinChains } from "./chains";

export class BitcoinTargetChain extends AbstractTargetChain<BitcoinChainId> {
  protected readonly chainData: BitcoinChainData;

  public constructor(chainId: BitcoinChainId) {
    super(chainId);
    this.chainData = BitcoinChains[chainId];
  }

  public get label() {
    return this.chainData.name;
  }

  public get image() {
    return this.chainData.image;
  }

  public computeAddress(publicKey: Secp256k1PublicKey) {
    const compressed = getSecp256k1CompressedPublicKey(publicKey);

    // Use P2WPKH (Native SegWit) address format
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(compressed),
      network:
        this.chainId === BitcoinChainId.Bitcoin
          ? bitcoin.networks.bitcoin
          : bitcoin.networks.testnet,
    });

    if (!address) {
      throw new Error("Failed to generate Bitcoin address from public key");
    }

    return address;
  }

  protected async obiAccountAddressQueryFn(publicKeys: ObiAccountPublicKeys) {
    return this.computeAddress(publicKeys.secp256k1);
  }

  public isNativeAsset(assetId: Caip19AssetId) {
    return assetId === this.nativeCaip19AssetId;
  }

  public isTokenAsset(_: Caip19AssetId) {
    return false;
  }

  protected get nativeCaip19AssetId(): Caip19AssetId {
    return `${this.chainId}/slip44:0`;
  }

  public async nativeBalancesQueryFn(address: string) {
    const url =
      this.chainId === BitcoinChainId.Bitcoin
        ? `https://mempool.space/api/address/${address}`
        : `https://mempool.space/testnet4/api/address/${address}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }

      const data = await response.json();
      const confirmedBalance =
        data.chain_stats?.funded_txo_sum - data.chain_stats?.spent_txo_sum || 0;
      const unconfirmedBalance =
        data.mempool_stats?.funded_txo_sum -
          data.mempool_stats?.spent_txo_sum || 0;
      const totalBalance = confirmedBalance + unconfirmedBalance;

      return [
        {
          assetId: this.nativeCaip19AssetId,
          rawAmount: totalBalance.toString(),
        },
      ];
    } catch (error) {
      console.error("Error fetching Bitcoin balance:", error);
      return [];
    }
  }

  public async tokenBalanceQueryFn(_: {
    address: string;
    assetId: Caip19AssetId;
  }) {
    throw new Error("Not implemented");
    return "";
  }

  public async assetInfo(id: Caip19AssetId): Promise<AssetInfo | null> {
    const { namespace, reference, chainId } = parseCaip19AssetId(id);
    if (chainId !== this.chainId) {
      return null;
    }

    if (namespace === "slip44" && reference === "0") {
      return {
        name: "Bitcoin",
        symbol: "BTC",
        decimals: 8,
        image: this.image,
      };
    }

    return null;
  }

  public validateAddress(address: string): boolean {
    try {
      const result = bitcoin.address.fromBech32(address);
      return !!result;
    } catch {
      return false;
    }
  }

  public handleWalletConnectSessionRequest(
    _: SessionRequestPayload,
  ): Promise<SessionRequestResponse> {
    // TODO:
    throw new Error("Not implemented");
  }

  public denomToCaip19AssetId(denom: string): Caip19AssetId | null {
    if (denom === "BTC") {
      return this.nativeCaip19AssetId;
    }

    return null;
  }

  public caip19AssetIdToDenom(assetId: Caip19AssetId): string | null {
    if (assetId === this.nativeCaip19AssetId) {
      return "BTC";
    }

    return null;
  }

  public get disabled() {
    return false;
  }
}
