import { KeyGenerator, Signer } from "../mpc-ecdsa-wasm/mpc_bindings";
import { Parameters, PartySignup } from "../types/mpc-ecdsa-wasm-types.js";

// @ts-ignore this is from MPC wasm
export function keygen(params: Parameters): any[] {
  const keygens: KeyGenerator[] = [];
  for (let p = 1; p <= params.parties; p++) {
    const party: PartySignup = {
      number: p,
      uuid: "some-uuid",
    };
    const keygen = new KeyGenerator(params, party);
    keygens.push(keygen);
  }
  // @ts-ignore this is from MPC wasm
  const partyToOutgoingRoundMsgs: { [key: number]: any[] } = {};

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
              // @ts-expect-error this should be fine
              const outgoingRoundMsgWithRecipient = partyToOutgoingRoundMsgs[
                party_signer_idx
              ][party_round_msg_idx] as any;
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
              // @ts-expect-error this should be fine
              const roundMsgWithoutRecipient = partyToOutgoingRoundMsgs[
                party_signer_idx
              ][0] as any;
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

  const keys: any[] = [];
  for (let p = 0; p < params.parties; p++) {
    // @ts-expect-error this should be fine
    keys.push(keygens[p].create());
  }
  return keys;
}

export function createSignersAndPresign(
  local_keys: any[],
  selectedPartyIds: number[],
): Signer[] {
  const signers: Signer[] = [];
  for (
    let selectedPartyIdx = 0;
    selectedPartyIdx < selectedPartyIds.length;
    selectedPartyIdx++
  ) {
    const signer = new Signer(
      selectedPartyIdx + 1,
      selectedPartyIds,
      // @ts-expect-error this should be fine

      local_keys[selectedPartyIds[selectedPartyIdx] - 1],
    );
    signers.push(signer);
  }
  const partyToOutgoingRoundMsgs: { [key: number]: any[] } = {};

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
            // @ts-expect-error this should be fine
            const outgoingRoundMsgWithRecipient = partyToOutgoingRoundMsgs[
              selectedPartyId
            ][party_round_msg_idx] as any;
            const keygenIndex =
              Number(outgoingRoundMsgWithRecipient.receiver) - 1;
            console.log(
              `presign ${keygenIndex} handleIncoming round:${outgoingRoundMsgWithRecipient.round} msg sender:${outgoingRoundMsgWithRecipient.sender} receiver:${outgoingRoundMsgWithRecipient.receiver})`,
            );
            // @ts-expect-error this should be fine

            signers[keygenIndex].handleIncoming(outgoingRoundMsgWithRecipient);
          } else {
            // @ts-expect-error this should be fine
            const roundMsgWithoutRecipient = partyToOutgoingRoundMsgs[
              selectedPartyId
            ][0] as any;
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
