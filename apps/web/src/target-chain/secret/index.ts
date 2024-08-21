import { PriceProvider } from "@/price-provider";
import {
  SecretChainData,
  SecretChainId,
  SecretChains,
} from "@/target-chain/secret/chains";
import { Chain } from "@chain-registry/types";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import {
  Caip19AssetId,
  parseCaip19AssetId,
  parseCaip2ChainId,
} from "@obi-wallet/sdk-caip";
import {
  getSec256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import {
  SessionRequestPayload,
  SessionRequestResponse,
} from "@obi-wallet/wallet-connect";
import { getSdkError } from "@walletconnect/utils";
import { bech32 } from "bech32";
import { chains } from "chain-registry";
import { pubkeyToAddress } from "secretjs";
import invariant from "tiny-invariant";

export class SecretTargetChain extends AbstractTargetChain<SecretChainId> {
  public readonly secretChainId: string;
  protected readonly chainData: SecretChainData;
  protected readonly chain: Chain;

  public constructor(chainId: SecretChainId) {
    super(chainId);
    this.chainData = SecretChains[chainId];
    const { reference } = parseCaip2ChainId(chainId);
    this.secretChainId = reference;
    const chain = chains.find((c) => {
      return c.chain_id === reference;
    });
    invariant(chain, `Chain not found for ${reference}`);
    this.chain = chain;
  }

  public get label() {
    return this.chainData.name;
  }

  public get image() {
    return this.chainData.image;
  }

  public get disabled() {
    return this.chainData.disabled ?? false;
  }

  public computeAddress(publicKey: Secp256k1PublicKey): string {
    return pubkeyToAddress(
      getSec256k1CompressedPublicKey(publicKey),
      this.chainData.prefix,
    );
  }

  protected async obiAccountAddressQueryFn(publicKey: Secp256k1PublicKey) {
    return this.computeAddress(publicKey);
  }

  public isNativeAsset(assetId: Caip19AssetId) {
    const { chainId, namespace } = parseCaip19AssetId(assetId);
    return (
      chainId === this.chainId &&
      (namespace === "native" || namespace === "factory" || namespace === "ibc")
    );
  }

  public isTokenAsset(assetId: Caip19AssetId) {
    const { chainId, namespace } = parseCaip19AssetId(assetId);
    return chainId === this.chainId && namespace === "cw20";
  }

  public async nativeBalancesQueryFn(_address: string) {
    // TODO:
    return [];
  }

  public async tokenBalanceQueryFn(_: {
    address: string;
    assetId: Caip19AssetId;
  }) {
    // TODO:
    return "0";
  }

  public async newPriceQueryFn(id: Caip19AssetId) {
    const priceInfo = await PriceProvider.getInstance().priceInfo(id);
    if (priceInfo) return priceInfo;

    return { usdValue: "0" };
  }

  // TODO:
  protected denomMetadata(_denom: string) {}

  // TODO:
  public tokenInfo(_contract: string) {}

  // TODO:
  public async calculateFee() {}

  // TODO:
  public async calculateHashToSign() {}

  // TODO:
  public async sign() {}

  // TODO:
  public async signAndBroadcast() {}

  // TODO:
  public async newAssetInfo(_id: Caip19AssetId) {
    return null;
  }

  public validateAddress(address: string): boolean {
    const { prefix } = bech32.decode(address);
    return prefix === this.chainData.prefix;
  }

  // TODO: aminoTypes
  // TODO: registry
  // TODO: getSupportedWalletConnectNamespaces

  // TODO:
  public async handleWalletConnectSessionRequest(
    _: SessionRequestPayload,
  ): Promise<SessionRequestResponse> {
    return { error: getSdkError("WC_METHOD_UNSUPPORTED") };
  }

  public denomToCaip19AssetId(denom: string): Caip19AssetId | null {
    if (denom.startsWith("factory/")) {
      return `${this.chainId}/factory:${denom.replace("factory/", "").replace("/", "%2F")}`;
    }

    if (denom.startsWith("ibc/")) {
      return `${this.chainId}/ibc:${denom.replace("ibc/", "").replace("/", "%2F")}`;
    }

    if (denom.startsWith(this.chainData.prefix)) {
      return `${this.chainId}/cw20:${denom.replace("/", "%2F")}`;
    }

    return `${this.chainId}/native:${denom}`;
  }

  public caip19AssetIdToDenom(assetId: Caip19AssetId): string | null {
    const { namespace, reference } = parseCaip19AssetId(assetId);
    switch (namespace) {
      case "native":
        return reference.replace("%2F", "/");
      case "factory":
        return `factory/${reference.replace("%2F", "/")}`;
      case "ibc":
        return `ibc/${reference.replace("%2F", "/")}`;
      case "cw20":
        return reference.replace("%2F", "/");
      default:
        return null;
    }
  }
}
