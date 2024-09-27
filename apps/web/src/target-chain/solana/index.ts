import {
  AbstractTargetChain,
  AssetInfo,
  Caip19Asset,
} from "@obi-wallet/sdk-abstract-target-chain";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { ObiAccountPublicKeys } from "@obi-wallet/sdk-obi-account";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import {
  SessionRequestPayload,
  SessionRequestResponse,
} from "@obi-wallet/wallet-connect";

import { SolanaChainData, SolanaChainId, SolanaChains } from "./chains";

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
    // TODO:
    return "";
    // throw new Error("Method image not implemented.");
  }

  public get disabled() {
    return this.chainData.disabled ?? false;
  }

  public computeAddress(_publicKey: Secp256k1PublicKey): string {
    // TODO:
    throw new Error("Method computeAddress not implemented.");
  }

  protected async obiAccountAddressQueryFn(
    publicKeys: ObiAccountPublicKeys,
  ): Promise<string> {
    return publicKeys.ed25519.value;
  }

  public validateAddress(_address: string): boolean {
    // TODO:
    throw new Error("Method validateAddress not implemented.");
  }

  public isNativeAsset(_assetId: Caip19AssetId): boolean {
    // TODO:
    throw new Error("Method isNativeAsset not implemented.");
  }

  public isTokenAsset(_assetId: Caip19AssetId): boolean {
    // TODO:
    throw new Error("Method isTokenAsset not implemented.");
  }

  public nativeBalancesQueryFn(_address: string): Promise<Caip19Asset[]> {
    // TODO:
    throw new Error("Method nativeBalancesQueryFn not implemented.");
  }

  public tokenBalanceQueryFn(_: {
    address: string;
    assetId: Caip19AssetId;
  }): Promise<string> {
    // TODO:
    throw new Error("Method tokenBalanceQueryFn not implemented.");
  }

  public assetInfo(_id: Caip19AssetId): Promise<AssetInfo | null> {
    // TODO:
    throw new Error("Method assetInfo not implemented.");
  }

  public handleWalletConnectSessionRequest(
    _payload: SessionRequestPayload,
  ): Promise<SessionRequestResponse> {
    // TODO:
    throw new Error(
      "Method handleWalletConnectSessionRequest not implemented.",
    );
  }

  public denomToCaip19AssetId(_denom: string): Caip19AssetId | null {
    // TODO:
    throw new Error("Method denomToCaip19AssetId not implemented.");
  }

  public caip19AssetIdToDenom(_assetId: Caip19AssetId): string | null {
    // TODO:
    throw new Error("Method caip19AssetIdToDenom not implemented.");
  }
}
