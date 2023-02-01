import { MsgInstantiateContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import {
  ChainStore,
  cosmos,
  Draft,
  MultisigKey,
  RequestObiCosmosSignAndBroadcastMsg,
  WalletsStore,
} from "@obi-wallet/common";
import { InstantiateMsg } from "@obi-wallet/proxy-contract";
import { MsgInstantiateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import invariant from "tiny-invariant";

export async function handleCosmos({
  draft,
  demoMode,
  chainStore,
  walletsStore,
}: {
  draft: Draft<MultisigKey>;
  demoMode: boolean;
  chainStore: ChainStore;
  walletsStore: WalletsStore;
}) {
  const multisigKey = draft.value;
  // TODO: shuffle?

  const multisigPublicKey = cosmos.createMultisigPublicKey({
    multisigKey,
  });

  const { currentCosmosChainInformation } = chainStore;

  const owner = cosmos.getAddress({
    publicKey: multisigPublicKey,
    chainId: currentCosmosChainInformation.chainId,
  });

  const rawMessage: InstantiateMsg = {
    fee_lend_repay_wallet: currentCosmosChainInformation.debtRepayAddress,
    home_network: currentCosmosChainInformation.chainId,
    hot_wallets: [],
    owner,
    signer_types: multisigKey.signerTypes,
    signers: multisigPublicKey.value.pubkeys.map((publicKey) => {
      return cosmos.getAddress({
        publicKey,
        chainId: currentCosmosChainInformation.chainId,
      });
    }),
    uusd_fee_debt: currentCosmosChainInformation.startingUsdDebt,
  };

  const value: MsgInstantiateContract = {
    sender: owner,
    admin: owner,
    // @ts-expect-error should be passed as a string
    codeId: Long.fromInt(
      currentCosmosChainInformation.currentCodeId
    ).toString(),
    label: "Obi Proxy",
    msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
    funds: [],
  };
  const message: MsgInstantiateContractEncodeObject = {
    typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract",
    value,
  };

  const response = await RequestObiCosmosSignAndBroadcastMsg.send({
    multisigKey: multisigKey.serialize(),
    encodeObjects: [message],
    demoMode,
    cancelable: false,
    isOnboarding: true,
  });

  try {
    invariant(response.rawLog, "Expected `response` to have `rawLog`.");
    const rawLog = JSON.parse(response.rawLog) as [
      {
        events: [
          {
            type: string;
            attributes: { key: string; value: string }[];
          }
        ];
      }
    ];
    const instantiateEvent = rawLog[0].events.find((e) => {
      return e.type === "instantiate";
    });
    invariant(
      instantiateEvent,
      "Expected `rawLog` to contain `instantiate` event."
    );
    const contractAddress = instantiateEvent.attributes.find((a) => {
      return a.key === "_contract_address";
    });
    invariant(
      contractAddress,
      "Expected `instantiateEvent` to contain `_contract_address` attribute."
    );
    const serializedData = {
      chain: chainStore.currentChain,
      owner: multisigKey.serialize(),
      proxyAddress: {
        address: contractAddress.value,
        codeId: chainStore.currentCosmosChainInformation.currentCodeId,
      },
    };
    if (demoMode) {
      await walletsStore.addMultisigDemoWallet(serializedData);
    } else {
      await walletsStore.addMultisigWallet(serializedData);
    }
  } catch (e) {
    console.log(response.rawLog);
  }
}
