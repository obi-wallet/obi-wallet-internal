import { KeyPairIntentionsHandler } from "@/keys/intentions-handler";
import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { TargetChain } from "@/target-chain";
import { CosmosChainId, isCosmosChainId } from "@/target-chain/cosmos/chains";
import { createTestSuite } from "@/tests";
import {
  ApproveIntentionsProps,
  IntentionsResults,
} from "@/user-interactions/approve-intentions";
import { ApproveMessagesProps } from "@/user-interactions/approve-messages";
import { signAndBroadcastTransactionUserInteractionToApproveMessagesProps } from "@/user-interactions/sign-and-broadcast-transaction-handler";
import { calculateFee } from "@cosmjs/stargate";
import { Encoding } from "@obi-wallet/encoding";
import {
  ObservableMpcWallet,
  SignAndBroadcastTransactionUserInteraction,
} from "@obi-wallet/sdk";
import { toJS } from "mobx";
import invariant from "tiny-invariant";

async function mockApproveIntentions({
  multisigKey,
  intentions,
  onApprove,
}: ApproveIntentionsProps) {
  const intentionsResults = new IntentionsResults();
  invariant(multisigKey.primaryKey, "Expected primary key to exist");
  const keyPair = toJS(multisigKey.primaryKey.payload);
  const intentionsHandler = new KeyPairIntentionsHandler({
    owner: multisigKey,
    payload: intentions,
    keyPair,
  });
  const result = await intentionsHandler.handle();
  intentionsResults.set(result.publicKey, result.intentionsResult);

  onApprove(intentionsResults);
}

async function mockApproveMessages({
  targetChainId,
  messages,
  memo,
  onApprove,
}: ApproveMessagesProps) {
  const wallet = ObservableMpcWallet.create(MOCK_WALLET_DATA);
  invariant(isCosmosChainId(targetChainId), "Invalid chainId");

  const targetChain = TargetChain.chainId(targetChainId);

  // Mocking targetChain.calculateFee
  const gasEstimation = 1;
  const fee = calculateFee(
    Math.round(gasEstimation * 2),
    // @ts-expect-error accessing protected property
    targetChain.gasPrice!,
  );
  const hash = await targetChain.calculateHashToSign({
    wallet,
    fee,
    messages,
    memo,
  });
  const txInfo = {
    fee,
    hash: Encoding.fromBytes(hash).toHex(),
  };

  const intentionsPayload = {
    signHashes: [Encoding.fromHex(txInfo.hash).toBytes()],
    decryptMessages: [],
    decryptMultisigKeyEncryptedMessages: [],
  };

  let intentionsResults: IntentionsResults | null = null;
  await mockApproveIntentions({
    multisigKey: wallet.owner,
    keyMetaData: {},
    intentions: intentionsPayload,
    onApprove(result: IntentionsResults) {
      intentionsResults = result;
    },
  });
  invariant(intentionsResults, "intentionsResults should now be defined");

  // Mock approve
  await onApprove({
    wallet,
    fee: txInfo.fee,
    intentionsResults,
    intentionsPayload,
  });
}

export const testSuite = createTestSuite(({ test }) => {
  test("SignAndBroadcastTransactionUserInteractionHandler", async () => {
    const sendMessage = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: "sei1kvjg92ldmughvhcynu72ef3zjgrx9rdkdct83l",
        toAddress: "sei1kvjg92ldmughvhcynu72ef3zjgrx9rdkdct83l",
        amount: [
          {
            denom: "usei",
            amount: "1000000",
          },
        ],
      },
    };

    const interaction: SignAndBroadcastTransactionUserInteraction = {
      payload: {
        messages: [sendMessage],
        memo: "a memo",
        mockOnly: true,
        cancelable: true,
        targetChainId: CosmosChainId.Sei,
        walletMeta: {
          userEntryAddress: MOCK_WALLET_DATA.userEntryAddress,
        },
      },
      resolve: () => {},
      reject: () => {},
    };

    const props =
      signAndBroadcastTransactionUserInteractionToApproveMessagesProps(
        interaction,
      );

    await mockApproveMessages(props);
  });
});
