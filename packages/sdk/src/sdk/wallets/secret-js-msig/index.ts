import { TxResponse } from "secretjs";

import { KeyType, SerializedProxyWallet } from "./types";
import { SecretJsChainIds, SecretJsChains } from "../../../chains";
import { MultisigKey } from "../../../data-structures";
import { AbstractWalletsSdk } from "../abstract";
//import { add } from "ramda";

export class SecretJsMsigWalletSdk extends AbstractWalletsSdk {
  /// The creation transaction doesn't actually need a user interaction
  /// since the API will create it for the user, allowing smoother UX
  /// and better retry/interrupt handling.
  public async getAsyncDetailsAndFirstOwnerUpdate({
    multisigKey,
    // Demo Mode not implemented here for now
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<{
    homeAccountAddress: string;
    evmSigningAddress: string;
    evmUserContractAddress: string;
  }> {
    const _demoMode = demoMode;
    //const chain = secretJsChains["secret-4"];

    const {
      homeAccountAddress,
      evmSigningAddress,
      evmUserContractAddress,
      ownerIndex,
    } = multisigKey.setupDetails!;
    const chain = SecretJsChains[SecretJsChainIds.MAINNET];
    console.log("Calling setup/first-update-owner to " + multisigKey.address);
    console.log(
      "At this point, keys are is: " +
        JSON.stringify(
          multisigKey.keys.map(({ type, publicKey }) => {
            if (!Object.values(KeyType).includes(type as KeyType)) {
              throw new Error(`Invalid key type: ${type}`);
            }
            return {
              type: type as KeyType,
              publicKey,
            };
          }),
        ),
    );
    const proxyWallet: SerializedProxyWallet = {
      proxyAddress: {
        address: homeAccountAddress,
        codeId: chain.currentCodeIds.userAccount,
      },
      evmUserContractAddress: evmUserContractAddress,
      evmSigningAddress: evmSigningAddress,
      owner: {
        threshold: String(multisigKey.threshold),
        keys: multisigKey.keys.map(({ type, publicKey }) => {
          if (!Object.values(KeyType).includes(type as KeyType)) {
            throw new Error(`Invalid key type: ${type}`);
          }
          return {
            type: type as KeyType,
            publicKey,
          };
        }),
      },
    };
    const _cloudflareResponse = await fetch(
      `https://proxy-wallets.obiwallet.workers.dev/add`,
      // `http://127.0.0.1:8787/add`,
      {
        method: "POST",
        body: JSON.stringify({
          chainId: SecretJsChainIds.MAINNET,
          proxyWallet,
        }),
        headers: {
          "Api-Version": "v1",
          Env:
            process.env.NEXT_PUBLIC_ENV === "production"
              ? "production"
              : "staging",
        },
      },
    );
    const response = await fetch("/api/setup/first-update-owner", {
      method: "POST",
      body: JSON.stringify({
        owner: multisigKey,
        ownerAddress: multisigKey.address,
        ownerIndex,
        evmUserContractAddress,
        evmSigningAddress,
        homeAccountAddress,
      }),
    });
    const {
      txResult,
    }: {
      txResult: TxResponse;
    } = await response.json();
    console.log("result of first-update-owner: " + JSON.stringify(txResult));

    return {
      homeAccountAddress,
      evmSigningAddress,
      evmUserContractAddress,
    };
  }
}
