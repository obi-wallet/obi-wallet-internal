import {
  Draft,
  MultisigKey,
  RequestObiTerraSignAndBroadcastMsg,
  terra,
  TerraChain,
} from "@obi-wallet/common";

export async function handleTerra({
  draft,
  demoMode,
  chainId,
}: {
  draft: Draft<MultisigKey>;
  demoMode: boolean;
  chainId: TerraChain;
}) {
  const multisigKey = draft.value;
  // TODO: shuffle?

  const signers = terra.getSigners({ multisigKey });
  const message = terra.getNewAccountMessage({
    address: multisigKey.address,
    signers,
    chainId,
  });

  const response = await RequestObiTerraSignAndBroadcastMsg.send({
    multisigKey: multisigKey.serialize(),
    messages: [message.toAmino()],
    demoMode,
    isOnboarding: true,
  });

  try {
    return {
      chain: chainId,
      owner: multisigKey.serialize(),
      proxyAddress: terra.parseNewAccountResponse(response),
      gatekeeperConfig: {
        beneficiaries: [],
        flexAccounts: [],
      },
      singlesigWallets: [],
    };
  } catch (e) {
    throw new Error(response.raw_log);
  }
}
