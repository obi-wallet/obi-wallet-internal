import { TxResponse } from "secretjs";

import { MultisigKey } from "../../../data-structures";
import {
  Secp256k1PublicKey,
} from "../../../keys/multisig";
import { AbstractWalletsSdk } from "../abstract";
import { secretJsChains } from "libs/sdk/src/chains";

export class SecretJsMsigWalletSdk extends AbstractWalletsSdk {
  /// The creation transaction doesn't actually need a user interaction
  /// since the API will create it for the user, allowing smoother UX
  /// and better retry/interrupt handling.
  public async createHomeAccountAndAddKey({
    multisigKey,
    // Demo Mode not implemented here for now
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<{
    homeAccountAddress: string;
    evmSignerAddress: string;
    evmUserContractAddress: string;
  }> {
    const _demoMode = demoMode;
    const chain = secretJsChains["secret-4"];
    console.warn(
      "Multisig info. address: " + multisigKey.address,
      "chainId: " + multisigKey.chainId,
      "threshold: " + multisigKey.threshold,
      "keys: " + JSON.stringify(multisigKey.keys),
      "signerTypes: " + multisigKey.signerTypes,
      "publicKey: " + JSON.stringify(multisigKey.publicKey),
    );
    console.log(
      "Calling setup/home-account with owner address " + multisigKey.address,
    );
    const response = await fetch("/api/setup/home-account", {
      method: "POST",
      body: JSON.stringify({
        owner: multisigKey,
        ownerAddress: multisigKey.address,
      }),
    });
    const {
      ownerAddress,
      homeAccountAddress,
      txResult,
    }: {
      ownerAddress: string;
      homeAccountAddress: string;
      txResult: TxResponse;
    } = await response.json();

    // add key will return an address quickly, before it's actually ready
    const addKeyResponse = await fetch("/api/setup/add-key", {
      method: "POST",
      body: JSON.stringify({
        userEntryAddress: homeAccountAddress,
        userEntryCodeHash: chain.userEntry.codeHash,
      }),
    });

    const addKeyResponseJson = await addKeyResponse.json();
    if (addKeyResponseJson.success) {
      const {
        success,
        publicKey,
        evmSignerAddress,
        evmUserContractAddress,
      }: {
        success: boolean;
        publicKey: Secp256k1PublicKey;
        evmSignerAddress: string;
        evmUserContractAddress: string;
      } = addKeyResponseJson;
      const _unused = { success, publicKey };
      console.log(
        "home account: " +
          homeAccountAddress +
          " with owner " +
          ownerAddress +
          ", tx hash " +
          txResult.transactionHash,
      );
      return {
        homeAccountAddress,
        evmSignerAddress,
        evmUserContractAddress,
      };
    } else {
      throw new Error("failed to save evm key");
    }
  }
}
