import { MultisigKey } from "../../../data-structures";
import { AbstractWalletsSdk } from "../abstract";

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
  }): Promise<{ homeAccountAddress: string }> {
    const _demoMode = demoMode;
    console.log(
      "Calling setup/home-account with owner address " + multisigKey.address,
    );
    const response = await fetch("/api/setup/home-account", {
      method: "POST",
      body: JSON.stringify({
        owner: multisigKey,
      }),
    });

    const { ownerAddress, homeAccountAddress, txHash } = await response.json();
    console.log(
      "home account: " +
        homeAccountAddress +
        " with owner " +
        ownerAddress +
        ", tx hash " +
        txHash,
    );
    return {
      homeAccountAddress,
    };

    /*
    const { rawLog } = response.payload;
    try {
      invariant(rawLog, "No log found");
      // TODO: zod
      const { events } = JSON.parse(rawLog)[0] as {
        events: {
          type: string;
          attributes: { key: string; value: string }[];
        }[];
      };
      const instantiateEvent = events.find((e) => {
        return e.type === "instantiate";
      });
      const contractAddresses = instantiateEvent?.attributes.filter((a) => {
        return a.key === "_contract_address";
      });
      invariant(
        Array.isArray(contractAddresses) && contractAddresses.length > 0,
        "No contract address found",
      );
      return {
        approved: true,
        payload: {
          success: true,
          proxyAddress: contractAddresses[0].value,
        },
      };
    } catch (e) {
      return {
        approved: true,
        payload: {
          success: false,
          description: "Could not parse log",
          originalPayload: response.payload,
        },
      };
    }
    */
  }
}
