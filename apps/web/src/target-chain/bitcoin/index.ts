import {
  AbstractTargetChain,
  Caip19Asset,
  AssetInfo as BaseAssetInfo, // Import AssetInfo from the base class
} from "@obi-wallet/sdk-abstract-target-chain";
import { BitcoinChainId } from "./chains";
import { MpcWallet } from "@obi-wallet/sdk";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { BitcoinMpcSigner } from "./mpc-signer";
import * as bitcoinjs from "bitcoinjs-lib";
import { Encoding } from "@obi-wallet/encoding";
import { fetch } from "cross-fetch";

export class BitcoinTargetChain extends AbstractTargetChain<string, string> {
  public readonly chainId: BitcoinChainId;

  constructor(chainId: BitcoinChainId) {
    super(chainId);
    this.chainId = chainId;
  }

  static create(chainId: BitcoinChainId): BitcoinTargetChain {
    return new BitcoinTargetChain(chainId);
  }

  /**
   * Getter for the human-readable label of the chain.
   */
  public get label(): string {
    return "Bitcoin";
  }

  /**
   * Getter for the image URL/icon representing the chain.
   */
  public get image(): string {
    return "/images/bitcoin.png"; // Update the path as per your assets
  }

  /**
   * Indicates whether the chain is disabled.
   */
  public get disabled(): boolean {
    return false; // Set to true if Bitcoin should be disabled
  }

  /**
   * Computes the Bitcoin address from a given Secp256k1 public key.
   * @param publicKey - The Secp256k1 public key.
   * @returns The corresponding Bitcoin address.
   */
  public computeAddress(publicKey: Secp256k1PublicKey): string {
    // Decode the Base64 public key to bytes
    const publicKeyBytes = Encoding.fromBase64(publicKey.value).toBytes();

    // Create a Buffer from the public key bytes
    const publicKeyBuffer = Buffer.from(publicKeyBytes);

    // Generate the P2PKH address
    const { address } = bitcoinjs.payments.p2pkh({
      pubkey: publicKeyBuffer,
      network: this.getBitcoinNetwork(),
    });

    if (!address) {
      throw new Error("Failed to compute Bitcoin address from public key");
    }

    return address;
  }

  /**
   * Implements the abstract method to query the account address.
   * @param publicKey - The Secp256k1 public key.
   * @returns A promise that resolves to the Bitcoin address.
   */
  async obiAccountAddressQueryFn(publicKey: Secp256k1PublicKey): Promise<string> {
    return this.computeAddress(publicKey);
  }

  /**
   * Validates a Bitcoin address.
   * @param address - The Bitcoin address to validate.
   * @returns True if valid, false otherwise.
   */
  public validateAddress(address: string): boolean {
    try {
      bitcoinjs.address.toOutputScript(address, this.getBitcoinNetwork());
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Determines the Bitcoin network based on the chain ID.
   * @returns The Bitcoin network configuration.
   */
  getBitcoinNetwork(): bitcoinjs.Network {
    if (this.chainId === "bitcoin-mainnet") {
      return bitcoinjs.networks.bitcoin;
    } else if (this.chainId === "bitcoin-testnet") {
      return bitcoinjs.networks.testnet;
    } else {
      throw new Error(`Unsupported Bitcoin chain ID: ${this.chainId}`);
    }
  }

  /**
   * Implements the abstract method to fetch native balances.
   * @param address - The Bitcoin address.
   * @returns A promise that resolves to an array of Caip19Asset.
   */
  public async nativeBalancesQueryFn(address: string): Promise<Caip19Asset[]> {
    const balance = await this.fetchBitcoinBalance(address);

    return [
      {
        assetId: this.denomToCaip19AssetId("BTC")!, // Non-null assertion as 'BTC' is supported
        rawAmount: balance.toString(),
      },
    ];
  }

  /**
   * Fetches the Bitcoin balance for a given address.
   * @param address - The Bitcoin address.
   * @returns A promise that resolves to the balance in satoshis.
   */
  private async fetchBitcoinBalance(address: string): Promise<number> {
    const network = this.chainId === "bitcoin-mainnet" ? "main" : "test3";
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/${network}/addrs/${address}/balance`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch Bitcoin balance");
    }
    const data = await response.json();
    return data.final_balance;
  }

  /**
   * Fetches the balance of a specific token asset for a given address.
   * @param params - An object containing the address and assetId.
   * @returns A promise that resolves to the token balance.
   */
  async tokenBalanceQueryFn({
    address,
    assetId,
  }: {
    address: string;
    assetId: `${string}:${string}/${string}:${string}`;
  }): Promise<string> {
    // Bitcoin doesn't support tokens natively, so return "0" for any token
    return "0";
    // Alternatively, you can throw an error if token queries should be disallowed
    // throw new Error("Bitcoin does not support token assets.");
  }

  /**
   * Retrieves information about a specific asset.
   * @param assetId - The CAIP-19 asset ID.
   * @returns A promise that resolves to the asset information or null if unsupported.
   */
  public async assetInfo(id: `${string}:${string}/${string}:${string}`): Promise<BaseAssetInfo | null> {
    if (id.toUpperCase() === "BTC" || id.toLowerCase() === "bip122:000000000019d6689c085ae165831e93/slip44:0") {
      return {
        // assetId: "bip122:000000000019d6689c085ae165831e93/slip44:0",
        symbol: "BTC",
        name: "Bitcoin",
        decimals: 8,
        image: this.image, // Ensure the image property is included
      };
    } else {
      return null; // Unsupported asset ID
      // Alternatively, throw an error:
      // throw new Error(`Unsupported asset ID: ${id}`);
    }
  }

  /**
   * Handles WalletConnect session requests.
   * @param request - The WalletConnect session request data.
   * @returns A promise that resolves to the session response.
   */
  public async handleWalletConnectSessionRequest(request: any): Promise<any> {
    // Bitcoin does not support WalletConnect natively.
    // You can choose to throw an error or implement a custom handler if needed.
    throw new Error("WalletConnect is not supported for Bitcoin.");
  }

  /**
   * Converts a denomination to a CAIP-19 asset ID.
   * @param denom - The denomination to convert.
   * @returns The corresponding CAIP-19 asset ID or null if unsupported.
   */
  public denomToCaip19AssetId(denom: string): `${string}:${string}/${string}:${string}` | null {
    if (denom.toUpperCase() === "BTC") {
      // Example CAIP-19 asset ID for Bitcoin; ensure this matches your CAIP-19 specification
      return "bip122:000000000019d6689c085ae165831e93/slip44:0" as `${string}:${string}/${string}:${string}`;
    } else {
      return null; // Unsupported denomination
      // Alternatively, throw an error:
      // throw new Error(`Unsupported denomination: ${denom}`);
    }
  }

  /**
   * Converts a CAIP-19 asset ID to its corresponding denomination.
   * @param assetId - The CAIP-19 asset ID to convert.
   * @returns The corresponding denomination or null if unsupported.
   */
  public caip19AssetIdToDenom(assetId: string): string | null {
    if (
      assetId.toLowerCase() === "bip122:000000000019d6689c085ae165831e93/slip44:0" ||
      assetId.toUpperCase() === "BTC"
    ) {
      return "BTC";
    } else {
      return null; // Unsupported CAIP-19 asset ID
      // Alternatively, throw an error:
      // throw new Error(`Unsupported CAIP-19 asset ID: ${assetId}`);
    }
  }

  /**
   * Determines if a given asset is native.
   * @param assetId - The CAIP-19 asset ID.
   * @returns True if native, false otherwise.
   */
  public isNativeAsset(assetId: `${string}:${string}/${string}:${string}`): boolean {
    const nativeAssetId = this.denomToCaip19AssetId("BTC");
    return assetId === nativeAssetId;
  }

  /**
   * Determines if a given asset is a token.
   * @param assetId - The CAip19 asset ID.
   * @returns True if token, false otherwise.
   */
  public isTokenAsset(assetId: `${string}:${string}/${string}:${string}`): boolean {
    // Bitcoin does not support tokens natively
    return false;
  }

  /**
   * Creates an instance of BitcoinMpcSigner for signing transactions.
   * @param wallet - The MPC wallet instance.
   * @returns An instance of BitcoinMpcSigner.
   */
  public async mpcSigner(wallet: MpcWallet): Promise<BitcoinMpcSigner> {
    return await BitcoinMpcSigner.fromWallet(wallet, this.chainId);
  }

  // Implement other abstract methods as needed...
}
