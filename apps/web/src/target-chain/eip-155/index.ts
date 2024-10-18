import { HomeChain } from "@/home-chain";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { rootStore } from "@/stores";
import {
  allEip155Chains,
  Eip155ChainData,
  Eip155ChainId,
  Eip155Chains,
} from "@/target-chain/eip-155/chains";
import { Eip155MpcSigner } from "@/target-chain/eip-155/mpc-signer";
import { IntentionsResults } from "@/user-interactions/approve-intentions";
import { SignAndBroadcastEvm } from "@/user-interactions/sign-and-broadcast/evm";
import { filterMap } from "@/util/filter-map";
import { HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import { MpcWallet } from "@obi-wallet/sdk";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import { AssetRegistry } from "@obi-wallet/sdk-asset-registry";
import { Caip19AssetId, parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import { deserialize, serialize } from "@obi-wallet/sdk-json";
import { ObiAccountPublicKeys } from "@obi-wallet/sdk-obi-account";
import {
  getSecp256k1UncompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import {
  Key,
  SessionRequestPayload,
  SessionRequestResponse,
} from "@obi-wallet/wallet-connect";
import { getSdkError } from "@walletconnect/utils";
import { toEcdsaKernelSmartAccount } from "permissionless/accounts";
import invariant from "tiny-invariant";
import {
  Address,
  createPublicClient,
  erc20Abi,
  getAddress,
  hexToBigInt,
  http,
  isAddress,
  keccak256,
  LocalAccount,
} from "viem";
import { UserOperation, UserOperationCalls } from "viem/account-abstraction";
import { entryPoint07Address } from "viem/account-abstraction";
import { toAccount } from "viem/accounts";
import { z } from "zod";

export type EvmUserOperation = UserOperation<"0.7">;

export const SerializedEvmUserOperation = z
  .string()
  .brand("SerializedEvmUserOperation");
export type SerializedEvmUserOperation = z.infer<
  typeof SerializedEvmUserOperation
>;

export function serializeUserOperation(
  userOperation: EvmUserOperation,
): SerializedEvmUserOperation {
  return SerializedEvmUserOperation.parse(serialize(userOperation));
}

export function deserializeUserOperation(
  userOperation: SerializedEvmUserOperation,
): EvmUserOperation {
  return deserialize(userOperation);
}

export type EvmUserOperationCalls = UserOperationCalls<unknown[]>;

export const SerializedEvmUserOperationCalls = z
  .string()
  .brand("SerializedEvmUserOperationCalls");
export type SerializedEvmUserOperationCalls = z.infer<
  typeof SerializedEvmUserOperationCalls
>;

export function serializeUserOperationCalls(
  calls: EvmUserOperationCalls,
): SerializedEvmUserOperationCalls {
  return SerializedEvmUserOperationCalls.parse(serialize(calls));
}

export function deserializeUserOperationCalls(
  calls: SerializedEvmUserOperationCalls,
): EvmUserOperationCalls {
  return deserialize(calls);
}

export class Eip155TargetChain extends AbstractTargetChain<
  Eip155ChainId,
  HexEncodedStringWithPrefix
> {
  public readonly chainData: Eip155ChainData;

  public constructor(chainId: Eip155ChainId) {
    super(chainId);
    this.chainData = Eip155Chains[chainId];
  }

  public get label(): string {
    return this.chainData.chain.name;
  }

  public get image(): string {
    return this.chainData.image;
  }

  public get disabled(): boolean {
    return this.chainData.disabled ?? false;
  }

  public get eip155ChainId() {
    return this.chainData.chain.id;
  }

  public computeAddress(publicKey: Secp256k1PublicKey) {
    const u8 = getSecp256k1UncompressedPublicKey(publicKey);
    const hex = `0x${Buffer.from(u8).toString("hex")}`;
    const address = keccak256(`0x${hex.substring(4)}`).substring(26);
    return getAddress(`0x${address}`);
  }

  protected async obiAccountAddressQueryFn(
    publicKeys: ObiAccountPublicKeys,
  ): Promise<HexEncodedStringWithPrefix> {
    if (this.chainId === Eip155ChainId.BscTestnet) {
      return await new Eip155TargetChain(
        Eip155ChainId.Bsc,
      ).obiAccountAddressQueryFn(publicKeys);
    }

    const account = toAccount({
      address: this.computeAddress(publicKeys.secp256k1),
      async signMessage() {
        throw new Error("signMessage not implemented");
      },
      async signTransaction() {
        throw new Error("signTransaction not implemented");
      },
      async signTypedData() {
        throw new Error("signTypedData not implemented");
      },
    });

    const kernelAccount = await this.kernelAccount(account);
    return HexEncodedStringWithPrefix.parse(kernelAccount.address);
  }

  public isNativeAsset(assetId: Caip19AssetId) {
    const { chainId, namespace } = parseCaip19AssetId(assetId);
    return chainId === this.chainId && namespace === "native";
  }

  public isTokenAsset(assetId: Caip19AssetId) {
    const { chainId, namespace } = parseCaip19AssetId(assetId);
    return chainId === this.chainId && namespace === "erc20";
  }

  public async nativeBalancesQueryFn(address: string) {
    if (this.validateAddress(address)) {
      const balance = await this.publicClient.getBalance({
        address,
      });
      if (balance > 0) {
        return [
          {
            assetId: this.nativeCaip19AssetId,
            rawAmount: balance.toString(10),
          },
        ];
      }
    }
    return [];
  }

  public async tokenBalanceQueryFn({
    address,
    assetId,
  }: {
    address: string;
    assetId: Caip19AssetId;
  }) {
    if (!this.validateAddress(address)) return "0";

    const { namespace, reference } = parseCaip19AssetId(assetId);
    switch (namespace) {
      case "erc20": {
        if (this.validateAddress(reference)) {
          const rawAmount = await this.publicClient.readContract({
            address: reference,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address],
          });
          return rawAmount.toString(10);
        }
      }
    }

    return "0";
  }

  public async assetInfo(id: Caip19AssetId) {
    const asset = await AssetRegistry.getInstance().byId(id);
    if (asset?.assetInfo) return asset.assetInfo;

    const { namespace, reference } = parseCaip19AssetId(id);
    if (id === this.nativeCaip19AssetId) {
      const getImage = () => {
        switch (this.nativeCurrency.symbol) {
          case "AVAX":
            return "https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png?1696512369";
          case "ETH":
            return "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628";
          case "BNB":
          case "tBNB":
            return "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970";
          case "CRO":
            return "https://assets.coingecko.com/coins/images/7310/standard/cro_token_logo.png?1696507599";
          case "MATIC":
            return "https://assets.coingecko.com/coins/images/4713/standard/polygon.png?1698233745";
          default:
            return null;
        }
      };

      return {
        name: this.nativeCurrency.name,
        symbol: this.nativeCurrency.symbol,
        decimals: this.nativeCurrency.decimals,
        image: getImage(),
      };
    }

    if (namespace === "erc20" && this.validateAddress(reference)) {
      const response = await this.publicClient.multicall({
        contracts: [
          {
            address: reference,
            abi: erc20Abi,
            functionName: "decimals",
          },
          {
            address: reference,
            abi: erc20Abi,
            functionName: "name",
          },
          {
            address: reference,
            abi: erc20Abi,
            functionName: "symbol",
          },
        ],
      });
      return {
        name: response[1].result ?? "",
        symbol: response[2].result ?? "",
        decimals: response[0].result ?? 0,
        image: "",
      };
    }
    return null;
  }

  public get entryPoint() {
    return {
      address: entryPoint07Address,
      version: "0.7",
    } as const;
  }

  public validateAddress(address: string): address is Address {
    return isAddress(address);
  }

  public get nativeCurrency() {
    return this.chainData.chain.nativeCurrency;
  }

  public get publicClient() {
    return createPublicClient({
      chain: this.chainData.chain,
      transport: http(),
    });
  }

  public async kernelAccount(account: LocalAccount) {
    return await toEcdsaKernelSmartAccount({
      client: this.publicClient,
      entryPoint: this.entryPoint,
      owners: [account],
    });
  }

  public async signerFromWallet(wallet: MpcWallet) {
    return await Eip155MpcSigner.fromWallet(wallet, this.chainId);
  }

  public async localAccountFromWallet(wallet: MpcWallet) {
    const signer = await this.signerFromWallet(wallet);
    return toAccount(signer.accountSource);
  }

  public async calculateHashToSign({
    wallet,
    userOperation,
  }: {
    wallet: MpcWallet;
    userOperation: EvmUserOperation;
  }) {
    const signer = await Eip155MpcSigner.fromWallet(wallet, this.chainData.id);

    const account = toAccount(signer.accountSource);
    const kernelAccount = await this.kernelAccount(account);

    return await signer.mpcSigner.calculateHashToSign(async () => {
      await kernelAccount.signUserOperation(userOperation);
    });
  }

  public async sign({
    wallet,
    userOperation,
    intentionsPayload,
    intentionsResults,
  }: {
    wallet: MpcWallet;
    userOperation: EvmUserOperation;
    intentionsPayload: IntentionsPayload;
    intentionsResults: IntentionsResults;
  }) {
    const signer = await Eip155MpcSigner.fromWallet(wallet, this.chainData.id);
    signer.mpcSigner.addIntentionsResults({
      payload: intentionsPayload,
      results: intentionsResults,
    });

    const account = toAccount(signer.accountSource);
    const kernelAccount = await this.kernelAccount(account);

    const signature = await kernelAccount.signUserOperation(userOperation);
    return signature;
  }

  public async signAndBroadcast({
    wallet,
    userOperation,
    intentionsPayload,
    intentionsResults,
  }: {
    wallet: MpcWallet;
    userOperation: EvmUserOperation;
    intentionsPayload: IntentionsPayload;
    intentionsResults: IntentionsResults;
  }) {
    userOperation.signature = await this.sign({
      wallet,
      userOperation,
      intentionsPayload,
      intentionsResults,
    });
    const response = await fetch("/api/evm/send-user-operation", {
      method: "POST",
      body: serialize({
        homeChainId: wallet.homeChainId,
        targetChainId: this.chainData.id,
        userEntryAddress: wallet.userEntryAddress,
        userOperation: serializeUserOperation(userOperation),
      }),
    });
    const schema = z.object({
      hash: HexEncodedStringWithPrefix,
    });
    const { hash } = schema.parse(await response.json());
    return hash;
  }

  public async waitForUserOperationReceipt(hash: HexEncodedStringWithPrefix) {
    const response = await fetch("/api/evm/wait-for-user-operation-receipt", {
      method: "POST",
      body: serialize({
        targetChainId: this.chainData.id,
        hash,
      }),
    });
    const schema = z.object({
      success: z.boolean(),
      reason: z.string().optional(),
      txHash: HexEncodedStringWithPrefix,
    });
    return schema.parse(await response.json());
  }

  public static async getSupportedWalletConnectNamespaces() {
    const wallet = rootStore.current?.mpcWalletsStore.currentWallet;
    invariant(wallet, "Wallet not found");
    const publicKeys = await HomeChain.chainId(wallet.homeChainId).publicKeys(
      wallet.userEntryAddress,
    );

    const eip155Chains = allEip155Chains
      .map((targetChainId) => {
        return new Eip155TargetChain(targetChainId);
      })
      .filter((chain) => {
        return !chain.disabled;
      });

    const usableEip155Chains = await filterMap(
      async (chain) => {
        const address = await chain.obiAccountAddressQueryFn(publicKeys);
        return {
          chainId: chain.chainId,
          account: `${chain.chainId}:${address}`,
        };
      },
      eip155Chains,
      { catchErrors: true },
    );

    return {
      eip155: {
        chains: usableEip155Chains.map((chain) => {
          return chain.chainId;
        }),
        methods: [
          "eth_sendTransaction",
          "personal_sign",
          "wallet_switchEthereumChain",
        ],
        accounts: usableEip155Chains.map((chain) => {
          return chain.account;
        }),
        events: ["chainChanged", "accountsChanged"],
      },
    };
  }

  public static async getWalletConnectKeys(): Promise<Key[]> {
    return [];
  }

  public async handleWalletConnectSessionRequest({
    request,
  }: SessionRequestPayload): Promise<SessionRequestResponse> {
    const wallet = rootStore.current?.mpcWalletsStore.currentWallet;
    if (!wallet) {
      return { error: getSdkError("USER_DISCONNECTED") };
    }

    switch (request.method) {
      case "eth_sendTransaction": {
        const payload = request.params[0];

        const response = await SignAndBroadcastEvm.start({
          calls: serializeUserOperationCalls([
            {
              to: payload.to,
              data: payload.data,
              value: hexToBigInt(payload.value),
            },
          ]),
          cancelable: true,
          targetChainId: this.chainId,
          walletMeta: {
            userEntryAddress: wallet.userEntryAddress,
          },
        });
        if (response.approved) {
          const receipt = await this.waitForUserOperationReceipt(response.hash);
          return { result: receipt.txHash };
        } else {
          return {
            error: getSdkError("USER_REJECTED"),
          };
        }
      }
      case "personal_sign": {
        const _payload = request.params[0];
        // TODO:
        return { error: getSdkError("USER_REJECTED") };
      }
      case "wallet_switchEthereumChain":
        return { result: true };
      default:
        return { error: getSdkError("WC_METHOD_UNSUPPORTED") };
    }
  }

  public denomToCaip19AssetId(denom: string): Caip19AssetId | null {
    if (this.validateAddress(denom)) {
      const checksumAddress = getAddress(denom);
      if (checksumAddress === this.nativeAddress) {
        return this.nativeCaip19AssetId;
      } else {
        return `${this.chainId}/erc20:${checksumAddress}`;
      }
    }

    if (denom === this.nativeCurrency.symbol) {
      return this.nativeCaip19AssetId;
    }

    return null;
  }

  public caip19AssetIdToDenom(assetId: Caip19AssetId): string | null {
    const { namespace, reference } = parseCaip19AssetId(assetId);
    switch (namespace) {
      case "erc20":
        return reference;
      case "native":
        return this.nativeCurrency.symbol;
      default:
        return null;
    }
  }

  public get nativeCaip19AssetId(): Caip19AssetId {
    return `${this.chainId}/native:${this.nativeAddress}`;
  }

  protected get nativeAddress(): Address {
    return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  }
}
