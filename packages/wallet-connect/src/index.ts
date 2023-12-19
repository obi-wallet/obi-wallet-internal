import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";

export async function setupWalletConnect({
  projectId,
  metadata,
}: {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}) {
  const core = new Core({
    projectId,
  });

  const web3wallet = await Web3Wallet.init({
    core,
    metadata,
  });

  // TODO:
  web3wallet.on("session_proposal", ({ id, params }) => {
    console.log("incoming session proposal", id, params);
  });

  return web3wallet;
}
