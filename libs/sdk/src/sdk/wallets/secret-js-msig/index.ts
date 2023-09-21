import { TxResponse } from "secretjs";

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
    } = multisigKey.setupDetails;

    console.log("Calling setup/first-update-owner to " + multisigKey.address);
    const response = await fetch("/api/setup/first-update-owner", {
      method: "POST",
      body: JSON.stringify({
        owner: multisigKey,
        ownerAddress: multisigKey.address,
        ownerIndex,
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
