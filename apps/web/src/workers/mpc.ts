import type { DistributeSharesResponse } from "@/stores/mpc";
import type { KeyGenerator, Signer } from "@obi-wallet/mpc-ecdsa-wasm";
import {
  Parameters,
  Parameters as KeygenParam,
  PartySignup,
} from "@obi-wallet/mpc-ecdsa-wasm-types";
import invariant from "tiny-invariant";

let mpcPackage: typeof import("@obi-wallet/mpc-ecdsa-wasm") | null = null;

addEventListener("message", async () => {
  postMessage(await distributeShares());
});

async function distributeShares(): Promise<DistributeSharesResponse> {
  if (!mpcPackage) {
    mpcPackage = await import("@obi-wallet/mpc-ecdsa-wasm");
    await mpcPackage.default();
  }

  const keygenParam: KeygenParam = { parties: 3, threshold: 1 };
  const networkCombo: number[] = [1, 3];
  const backupCombo: number[] = [2, 3];

  const shares = keygen(keygenParam);

  const signersForContract = createSignersAndPresign(shares, networkCombo);
  const contractSignersCompletedOfflineStage =
    signersForContract[0]?.completedOfflineStage();

  // user share that is used to sign transaction with contract share
  const completedOfflineStageForContract =
    signersForContract[1]?.completedOfflineStage();
  const userShareForContract = {
    k_i: completedOfflineStageForContract.sign_keys.k_i,
    R: completedOfflineStageForContract.R,
    sigma_i: completedOfflineStageForContract.sigma_i,
    pubkey: completedOfflineStageForContract.local_key.y_sum_s,
  };

  const signersForBackup = createSignersAndPresign(shares, backupCombo);
  const backupSignersCompletedOfflineStage =
    signersForBackup[0]?.completedOfflineStage();

  // user share that is used to sign transaction with backup share
  const completedOfflineStageForBackup =
    signersForBackup[1]?.completedOfflineStage();
  const userShareForBackup = {
    k_i: completedOfflineStageForBackup.sign_keys.k_i,
    R: completedOfflineStageForBackup.R,
    sigma_i: completedOfflineStageForBackup.sigma_i,
    pubkey: completedOfflineStageForBackup.local_key.y_sum_s,
  };

  const easyShare = {
    preSignForNetworkShare: userShareForContract,
    preSignForBackupShare: userShareForBackup,
  };

  const networkShare = contractSignersCompletedOfflineStage;
  const backupShare = backupSignersCompletedOfflineStage;

  return {
    keygenParam,
    backupParticipants: backupCombo,
    networkParticipants: networkCombo,
    easyShare,
    backupShare,
    networkShare,
  };
}

// This is from MPC wasm
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function keygen(params: Parameters): any[] {
  invariant(mpcPackage, "MPC wasm package not loaded");
  const keygens: KeyGenerator[] = [];
  for (let p = 1; p <= params.parties; p++) {
    const party: PartySignup = {
      number: p,
      uuid: "some-uuid",
    };
    const keygen = new mpcPackage.KeyGenerator(params, party);
    keygens.push(keygen);
  }
  // This is from MPC wasm
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const partyToOutgoingRoundMsgs: Record<number, any[]> = {};

  function handleRound() {
    if (Object.keys(partyToOutgoingRoundMsgs).length !== 0) {
      for (
        let party_signer_idx = 0;
        party_signer_idx < params.parties;
        party_signer_idx++
      ) {
        if (partyToOutgoingRoundMsgs[party_signer_idx] !== undefined) {
          for (
            let party_round_msg_idx = 0;
            party_round_msg_idx <
            // @ts-expect-error this should be fine
            partyToOutgoingRoundMsgs[party_signer_idx].length;
            party_round_msg_idx++
          ) {
            if (
              // @ts-expect-error this should be fine
              partyToOutgoingRoundMsgs[party_signer_idx][party_round_msg_idx]
                .receiver != null
            ) {
              const outgoingRoundMsgWithRecipient =
                partyToOutgoingRoundMsgs[
                  party_signer_idx
                  // This should be fine
                ]?.[party_round_msg_idx];
              const keygenIndex =
                Number(outgoingRoundMsgWithRecipient.receiver) - 1;
              console.log(
                `keygen ${keygenIndex} handleIncoming round:${outgoingRoundMsgWithRecipient.round} msg sender:${outgoingRoundMsgWithRecipient.sender} receiver:${outgoingRoundMsgWithRecipient.receiver})`,
              );
              // @ts-expect-error this should be fine
              keygens[keygenIndex].handleIncoming(
                outgoingRoundMsgWithRecipient,
              );
            } else {
              const roundMsgWithoutRecipient =
                partyToOutgoingRoundMsgs[
                  party_signer_idx
                  // This should be fine
                ]?.[0];
              for (
                let receiving_party_keygen_idx = 0;
                receiving_party_keygen_idx < params.parties;
                receiving_party_keygen_idx++
              ) {
                if (
                  receiving_party_keygen_idx + 1 !==
                  roundMsgWithoutRecipient.sender
                ) {
                  console.log(
                    `keygen ${
                      receiving_party_keygen_idx + 1
                    } handleIncoming round:${
                      roundMsgWithoutRecipient.round
                    } msg sender:${roundMsgWithoutRecipient.sender} receiver:${
                      roundMsgWithoutRecipient.receiver
                    })`,
                  );
                  // @ts-expect-error this should be fine
                  keygens[receiving_party_keygen_idx].handleIncoming(
                    roundMsgWithoutRecipient,
                  );
                }
              }
            }
          }
        }
      }
    }

    for (let p = 0; p < params.parties; p++) {
      // @ts-expect-error this should be fine
      const result = keygens[p].proceed();
      // index 1 of result is an array of outgoing round messages from the party that should be sent to other parties
      const roundOutgoingMessages = result[1];
      if (p === 0 && roundOutgoingMessages.length > 0) {
        // index 0 contains the round number
        console.log(`start round ${result[0]}`);
      }
      partyToOutgoingRoundMsgs[p] = result[1];
    }

    // Check if result[1] is an empty array
    // If so, then we are done. Do not proceed to next round.
    if (
      !Object.values(partyToOutgoingRoundMsgs).every(
        (msgs) => msgs.length === 0,
      )
    ) {
      handleRound();
    }
  }

  handleRound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keys: any[] = [];
  for (let p = 0; p < params.parties; p++) {
    // @ts-expect-error this should be fine
    keys.push(keygens[p].create());
  }
  return keys;
}

function createSignersAndPresign(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  local_keys: any[],
  selectedPartyIds: number[],
): Signer[] {
  invariant(mpcPackage, "MPC wasm package not loaded");
  const signers: Signer[] = [];
  for (
    let selectedPartyIdx = 0;
    selectedPartyIdx < selectedPartyIds.length;
    selectedPartyIdx++
  ) {
    const signer = new mpcPackage.Signer(
      selectedPartyIdx + 1,
      selectedPartyIds,
      // @ts-expect-error this should be fine

      local_keys[selectedPartyIds[selectedPartyIdx] - 1],
    );
    signers.push(signer);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const partyToOutgoingRoundMsgs: Record<number, any[]> = {};

  function handleRound() {
    if (Object.keys(partyToOutgoingRoundMsgs).length !== 0) {
      for (const selectedPartyId of selectedPartyIds) {
        for (
          let party_round_msg_idx = 0;
          party_round_msg_idx <
          // @ts-expect-error this should be fine

          partyToOutgoingRoundMsgs[selectedPartyId].length;
          party_round_msg_idx++
        ) {
          if (
            // @ts-expect-error this should be fine
            partyToOutgoingRoundMsgs[selectedPartyId][party_round_msg_idx]
              .receiver != null
          ) {
            const outgoingRoundMsgWithRecipient =
              partyToOutgoingRoundMsgs[selectedPartyId]?.[party_round_msg_idx];
            const keygenIndex =
              Number(outgoingRoundMsgWithRecipient.receiver) - 1;
            console.log(
              `presign ${keygenIndex} handleIncoming round:${outgoingRoundMsgWithRecipient.round} msg sender:${outgoingRoundMsgWithRecipient.sender} receiver:${outgoingRoundMsgWithRecipient.receiver})`,
            );
            // @ts-expect-error this should be fine

            signers[keygenIndex].handleIncoming(outgoingRoundMsgWithRecipient);
          } else {
            const roundMsgWithoutRecipient =
              partyToOutgoingRoundMsgs[selectedPartyId]?.[0];
            for (
              let receiving_party_keygen_idx = 0;
              receiving_party_keygen_idx < selectedPartyIds.length;
              receiving_party_keygen_idx++
            ) {
              if (
                receiving_party_keygen_idx + 1 !==
                roundMsgWithoutRecipient.sender
              ) {
                console.log(
                  `presign ${
                    receiving_party_keygen_idx + 1
                  } handleIncoming round:${
                    roundMsgWithoutRecipient.round
                  } msg sender:${roundMsgWithoutRecipient.sender} receiver:${
                    roundMsgWithoutRecipient.receiver
                  })`,
                );

                // @ts-expect-error this should be fine
                signers[receiving_party_keygen_idx].handleIncoming(
                  roundMsgWithoutRecipient,
                );
              }
            }
          }
        }
      }
    }

    for (
      let selectedPartyIdx = 0;
      selectedPartyIdx < selectedPartyIds.length;
      selectedPartyIdx++
    ) {
      const signer = signers[selectedPartyIdx];

      // @ts-expect-error this should be fine
      const result = signer.proceed();
      // index 1 of result is an array of outgoing round messages from the party that should be sent to other parties
      const roundOutgoingMessages = result[1];
      console.log(
        `proceed result${result} signerIdx${selectedPartyIdx} round ${result[0]} outgoing messages ${roundOutgoingMessages.length}`,
      );
      if (selectedPartyIdx === 0 && roundOutgoingMessages.length > 0) {
        // index 0 contains the round number
        console.log(`start round ${result[0]}`);
      }

      // @ts-expect-error this should be fine
      partyToOutgoingRoundMsgs[selectedPartyIds[selectedPartyIdx]] = result[1];
    }

    // Check if result[1] is an empty array
    // If so, then we are done. Do not proceed to next round.
    if (
      !Object.values(partyToOutgoingRoundMsgs).every(
        (msgs) => msgs.length === 0,
      )
    ) {
      handleRound();
    }
  }

  handleRound();

  return signers;
}
