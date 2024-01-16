import { connect } from "@/db";
import { getFeeLender } from "@/lib/fee-lender";
import { decompressPoint } from "@/lib/utils";
import {
  ChainIdSchema,
  Messages,
  SecretJsClient,
  SecretJsChains,
} from "@obi-wallet/sdk";
import { SecretNetworkClient } from "secretjs";

import { TxResponse } from "secretjs";
import invariant from "tiny-invariant";
import { z } from "zod";
import CryptoJS from "crypto-js";

const schema = z.object({
  chainId: ChainIdSchema,
  contractSignersCompletedOfflineStage: z.any(),
  backupSignersCompletedOfflineStage: z.any(),
  accountAddress: z.string(),
  contractParticipants: z.array(z.number()),
  multiPublicKeys: z.array(z.string()),
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const {
    chainId,
    contractSignersCompletedOfflineStage,
    backupSignersCompletedOfflineStage,
    accountAddress,
    contractParticipants,
    multiPublicKeys,
  } = result.data;
  const { wallet } = getFeeLender(chainId);

  try {
    const url = SecretJsChains[chainId].urls[0] as string,
      signerContractAddress = SecretJsChains[chainId].secretSigner.address,
      signerContractAddressHash = SecretJsChains[chainId].secretSigner.codeHash;

    const secretjs = new SecretNetworkClient({
      url,
      chainId: chainId,
      wallet: wallet,
      walletAddress: wallet.address,
    });

    let setShareMsg = {
      set_shares: {
        participants_to_completed_offline_stages: [
          {
            participants: contractParticipants,
            completed_offline_stage: {
              k_i: contractSignersCompletedOfflineStage.sign_keys.k_i.scalar,
              R: decompressPoint(contractSignersCompletedOfflineStage.R.point),
              sigma_i: contractSignersCompletedOfflineStage.sigma_i.scalar,
              pubkey: decompressPoint(
                contractSignersCompletedOfflineStage.local_key.y_sum_s.point,
              ),
              // TODO: replace with userEntryHash
              user_entry_code_hash: accountAddress,
            },
          },
        ],
        user_entry_address: accountAddress,
      },
    };

    let tx = await secretjs.tx.compute.executeContract(
      {
        sender: secretjs.address,
        contract_address: signerContractAddress,
        code_hash: signerContractAddressHash,
        msg: setShareMsg,
      },
      { gasLimit: 1_000_000 },
    );

    if (tx.code === 0) {
      // if success on distribute contract share, then store backup share to db
      let backupShare = JSON.stringify({
        k_i: backupSignersCompletedOfflineStage.sign_keys.k_i,
        R: backupSignersCompletedOfflineStage.R,
        sigma_i: backupSignersCompletedOfflineStage.sigma_i,
        pubkey: backupSignersCompletedOfflineStage.local_key.y_sum_s,
      });

      for (const pubkey of multiPublicKeys) {
        backupShare = CryptoJS.AES.encrypt(backupShare, pubkey).toString();
      }

      const BackupShareModel = await connect();
      await BackupShareModel.findOneAndUpdate(
        { accountAddress },
        {
          encryptionType: "1",
          backupShare,
        },
        { upsert: true },
      );

      return Response.json({
        success: true,
        tx,
      });
    } else
      throw new Error(`Error on executing contract to share: ${tx.rawLog}`);
  } catch (e) {
    console.error(e);
    return new Response("Parse error", {
      status: 500,
    });
  }
}
