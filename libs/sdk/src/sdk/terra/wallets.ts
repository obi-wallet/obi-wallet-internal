import invariant from "tiny-invariant";

import { MultisigKey } from "../../data-structures";
import { SignAndBroadcastTransactionUserInteraction } from "../../user-interactions";
import { AbstractUserInteractionResponse } from "../../user-interactions/abstract";
import { AbstractWalletsSdk } from "../abstract/wallets";
import { BroadcastTransactionResult } from "../common";
import { Messages } from "../messages";

export class TerraWalletsSdk extends AbstractWalletsSdk {
  public async createWallet({
    multisigKey,
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<
    AbstractUserInteractionResponse<
      { proxyAddress: string },
      {
        description: string;
        originalPayload: BroadcastTransactionResult;
      }
    >
  > {
    const response = await SignAndBroadcastTransactionUserInteraction.start({
      messages: [
        Messages.chainId(multisigKey.chainId).getCreateWalletMessage(
          multisigKey
        ),
      ],
      demoMode,
      cancelable: true,
      multisigKey,
    });

    if (!response.approved) return response;
    if (!response.payload.success)
      return {
        approved: true,
        payload: {
          success: false,
          description: "Transaction failed",
          originalPayload: response.payload,
        },
      };

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
        "No contract address found"
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
  }
}
