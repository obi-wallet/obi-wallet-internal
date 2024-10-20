import { HomeChain } from "@/home-chain";
import { KeyPairIntentionsHandler } from "@/keys/intentions-handler";
import { MOCK_PRIMARY_KEY_KEYPAIR } from "@/mocks/multisig-key";
import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { TargetChain } from "@/target-chain";
import { CosmosChainId, isCosmosChainId } from "@/target-chain/cosmos/chains";
import { createTestSuite } from "@/tests";
import { ApproveIntentionsProps } from "@/user-interactions/approve-intentions";
import { IntentionsResults } from "@/user-interactions/approve-intentions/utils";
import {
  ApproveMessagesProps,
  cosmosSignAminoToApproveMessagesProps,
  cosmosSignDirectUserInteractionToApproveMessagesProps,
} from "@/user-interactions/approve-messages";
import { CosmosSignAminoUserInteraction } from "@/user-interactions/sign-and-broadcast/evm/cosmos-sign-amino";
import { CosmosSignDirectUserInteraction } from "@/user-interactions/sign-and-broadcast/evm/cosmos-sign-direct";
import { signAndBroadcastTransactionUserInteractionToApproveMessagesProps } from "@/user-interactions/sign-and-broadcast-transaction-handler";
import { fromHex } from "@cosmjs/encoding";
import { makeSignDoc } from "@cosmjs/proto-signing";
import { calculateFee } from "@cosmjs/stargate";
import { Encoding } from "@obi-wallet/encoding";
import {
  KeyType,
  ObservableMpcWallet,
  SignAndBroadcastTransactionUserInteraction,
} from "@obi-wallet/sdk";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import invariant from "tiny-invariant";

async function mockApproveIntentions({
  multisigKey,
  keyPair,
  intentions,
  onApprove,
}: ApproveIntentionsProps & { keyPair: Secp256k1KeyPair }) {
  const intentionsResults = new IntentionsResults();
  invariant(
    multisigKey.primaryKey?.publicKey.value === keyPair.publicKey.value,
    "Expected primary key to match provided key pair",
  );
  const intentionsHandler = new KeyPairIntentionsHandler({
    owner: multisigKey,
    payload: intentions,
    keyPair,
    type: KeyType.Passkey,
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
  calculateHashToSign,
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
  const hash = calculateHashToSign
    ? await calculateHashToSign({ wallet, fee })
    : await targetChain.calculateHashToSign({
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
    decryptEasyShare: wallet.encryptedEasyShare,
    signHashes: [Encoding.fromHex(txInfo.hash).toBytes()],
    decryptMessages: [],
    decryptPrimaryKeyEncryptedMessages: [],
    decryptMultisigKeyEncryptedMessages: [],
  };

  let intentionsResults: IntentionsResults | null = null;
  await mockApproveIntentions({
    multisigKey: wallet.owner,
    keyPair: MOCK_PRIMARY_KEY_KEYPAIR,
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

  test("CosmosSignAminoUserInteraction", async () => {
    const wallet = ObservableMpcWallet.create(MOCK_WALLET_DATA);
    const publicKeys = await HomeChain.chainId(wallet.homeChainId).publicKeys(
      wallet.userEntryAddress,
    );

    const interaction: CosmosSignAminoUserInteraction = {
      payload: {
        walletMeta: {
          userEntryAddress: MOCK_WALLET_DATA.userEntryAddress,
        },
        signerAddress: await TargetChain.chainId(
          CosmosChainId.Sei,
        ).obiAccountAddress(publicKeys),
        signDoc: {
          chain_id: "pacific-1",
          account_number: "1",
          sequence: "",
          fee: {
            amount: [],
            gas: "2",
          },
          msgs: [],
          memo: "",
        },
        cancelable: true,
      },
      resolve(result) {
        console.log(result);
      },
      reject: () => {},
    };

    const props = cosmosSignAminoToApproveMessagesProps(interaction);

    await mockApproveMessages(props);
  });

  test("CosmosSignDirectUserInteraction", async () => {
    const wallet = ObservableMpcWallet.create(MOCK_WALLET_DATA);
    const publicKeys = await HomeChain.chainId(wallet.homeChainId).publicKeys(
      wallet.userEntryAddress,
    );

    const interaction: CosmosSignDirectUserInteraction = {
      payload: {
        walletMeta: {
          userEntryAddress: MOCK_WALLET_DATA.userEntryAddress,
        },
        signerAddress: await TargetChain.chainId(
          CosmosChainId.Sei,
        ).obiAccountAddress(publicKeys),
        signDoc: makeSignDoc(
          fromHex(
            "0a90010a1c2f636f736d6f732e62616e6b2e763162657461312e4d736753656e6412700a2d636f736d6f7331706b707472653766646b6c366766727a6c65736a6a766878686c63337234676d6d6b38727336122d636f736d6f7331717970717870713971637273737a673270767871367273307a716733797963356c7a763778751a100a0575636f736d120731323334353637",
          ),
          fromHex(
            "0a4e0a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a21034f04181eeba35391b858633a765c4a0c189697b40d216354d50890d350c7029012040a02080112130a0d0a0575636f736d12043230303010c09a0c",
          ),
          "pacific-1",
          1,
        ),
        cancelable: true,
      },
      resolve(result) {
        console.log(result);
      },
      reject: () => {},
    };

    const props =
      cosmosSignDirectUserInteractionToApproveMessagesProps(interaction);

    await mockApproveMessages(props);
  });
});
