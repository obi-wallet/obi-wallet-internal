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
import { HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import { MpcWallet } from "@obi-wallet/sdk";
import {
  AbstractTargetChain,
  AssetId,
} from "@obi-wallet/sdk-abstract-target-chain";
import { serialize } from "@obi-wallet/sdk-json";
import {
  getSec256k1UncompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import {
  SessionRequestPayload,
  SessionRequestResponse,
} from "@obi-wallet/wallet-connect";
import { getSdkError } from "@walletconnect/utils";
import { ENTRYPOINT_ADDRESS_V07, UserOperation } from "permissionless";
import { signerToEcdsaKernelSmartAccount } from "permissionless/accounts";
import invariant from "tiny-invariant";
import {
  Address,
  createPublicClient,
  getAddress,
  hexToBigInt,
  http,
  isAddress,
  keccak256,
  LocalAccount,
} from "viem";
import { toAccount } from "viem/accounts";
import { z } from "zod";

export type EvmUserOperation = UserOperation<"v0.7">;
// Replace all bigints with strings
export interface SerializedEvmUserOperation
  extends Omit<
    EvmUserOperation,
    | "nonce"
    | "callGasLimit"
    | "verificationGasLimit"
    | "preVerificationGas"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "paymasterVerificationGasLimit"
    | "paymasterPostOpGasLimit"
  > {
  nonce: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterVerificationGasLimit?: string;
  paymasterPostOpGasLimit?: string;
}

export function serializeUserOperation(
  userOperation: EvmUserOperation,
): SerializedEvmUserOperation {
  return {
    ...userOperation,
    nonce: userOperation.nonce.toString(),
    callGasLimit: userOperation.callGasLimit.toString(),
    verificationGasLimit: userOperation.verificationGasLimit.toString(),
    preVerificationGas: userOperation.preVerificationGas.toString(),
    maxFeePerGas: userOperation.maxFeePerGas.toString(),
    maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas.toString(),
    paymasterVerificationGasLimit:
      userOperation.paymasterVerificationGasLimit?.toString(),
    paymasterPostOpGasLimit: userOperation.paymasterPostOpGasLimit?.toString(),
  };
}

export function deserializeUserOperation(
  userOperation: SerializedEvmUserOperation,
): EvmUserOperation {
  return {
    ...userOperation,
    nonce: BigInt(userOperation.nonce),
    callGasLimit: BigInt(userOperation.callGasLimit),
    verificationGasLimit: BigInt(userOperation.verificationGasLimit),
    preVerificationGas: BigInt(userOperation.preVerificationGas),
    maxFeePerGas: BigInt(userOperation.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(userOperation.maxPriorityFeePerGas),
    paymasterVerificationGasLimit: userOperation.paymasterVerificationGasLimit
      ? BigInt(userOperation.paymasterVerificationGasLimit)
      : undefined,
    paymasterPostOpGasLimit: userOperation.paymasterPostOpGasLimit
      ? BigInt(userOperation.paymasterPostOpGasLimit)
      : undefined,
  };
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
    const u8 = getSec256k1UncompressedPublicKey(publicKey);
    const hex = `0x${Buffer.from(u8).toString("hex")}`;
    const address = keccak256(`0x${hex.substring(4)}`).substring(26);
    return getAddress(`0x${address}`);
  }

  protected async obiAccountAddressQueryFn(
    publicKey: Secp256k1PublicKey,
  ): Promise<HexEncodedStringWithPrefix> {
    if (this.chainId === Eip155ChainId.BscTestnet) {
      return await new Eip155TargetChain(
        Eip155ChainId.Bsc,
      ).obiAccountAddressQueryFn(publicKey);
    }

    const account = toAccount({
      address: this.computeAddress(publicKey),
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

  public async balancesQueryFn(address: string) {
    if (this.validateAddress(address)) {
      const balance = await this.publicClient.getBalance({
        address,
      });
      if (balance > 0) {
        return [
          {
            chainId: this.chainId,
            assetId: this.nativeCurrency.symbol,
            rawAmount: balance.toString(10),
          },
        ];
      }
    }
    return [];
  }

  public async priceQueryFn(id: AssetId) {
    if (id !== "ETH") {
      return { usdValue: "0" };
    }

    const url = `https://api.0xsquid.com/v1/token-price?chainId=${this.chainData.chain.id}&tokenAddress=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`;
    const response = await fetch(url);

    try {
      const schema = z.object({
        price: z.number(),
      });
      const { price } = schema.parse(await response.json());
      return { usdValue: price.toString(10) };
    } catch (e) {
      return { usdValue: "0" };
    }
  }

  public assetInfo(id: AssetId) {
    if (id === this.nativeCurrency.symbol) {
      const getImage = () => {
        switch (id) {
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

    return null;
  }

  public get entryPoint() {
    return ENTRYPOINT_ADDRESS_V07;
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
    return await signerToEcdsaKernelSmartAccount(this.publicClient, {
      entryPoint: this.entryPoint,
      signer: account,
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
        targetChainId: this.chainData.id,
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
    const publicKey = await HomeChain.chainId(wallet.homeChainId).publicKey(
      wallet.userEntryAddress,
    );

    const eip155Chains = allEip155Chains
      .map((targetChainId) => {
        return new Eip155TargetChain(targetChainId);
      })
      .filter((chain) => {
        return !chain.disabled;
      });

    return {
      eip155: {
        chains: eip155Chains.map((chain) => {
          return chain.chainId;
        }),
        methods: [
          "eth_sendTransaction",
          "personal_sign",
          "wallet_switchEthereumChain",
        ],
        accounts: await Promise.all(
          eip155Chains.map(async (chain) => {
            const address = await chain.obiAccountAddressQueryFn(publicKey);
            return `${chain.chainId}:${address}`;
          }),
        ),
        events: ["chainChanged", "accountsChanged"],
      },
    };
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

        const account = await this.localAccountFromWallet(wallet);
        const kernelAccount = await this.kernelAccount(account);
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
}
