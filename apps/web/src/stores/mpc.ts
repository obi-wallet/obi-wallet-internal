import { SecretJsChains, Wallets } from "@obi-wallet/sdk";
import { flow, makeObservable } from "mobx";

import { ConfigStore } from "./config";
import { createSignersAndPresign, keygen } from "@/lib/mpc";
import { Signer } from "@/mpc-ecdsa-wasm/mpc_bindings";
import { SecretNetworkClient, Wallet } from "secretjs";

export class MpcStore {
  protected readonly configStore: ConfigStore;
  protected readonly walletsStore: Wallets;

  private readonly KEYGEN_PARAM = {
    parties: 3,
    threshold: 1,
  };

  private readonly contractCombo = [1, 3];
  private readonly backupCombo = [2, 3];

  constructor({
    configStore,
    walletsStore,
  }: {
    configStore: ConfigStore;
    walletsStore: Wallets;
  }) {
    this.configStore = configStore;
    this.walletsStore = walletsStore;
    makeObservable<MpcStore, "configStore" | "walletsStore">(this, {
      configStore: false,
      walletsStore: false,
      distributeShares: flow,
    });
  }

  public async distributeShares() {
    try {
      if (this.walletsStore.currentChainId) {
        const shares = keygen(this.KEYGEN_PARAM);

        const signersForContract: Signer[] = createSignersAndPresign(
          shares,
          this.contractCombo,
        );
        const contract_signers_completed_offline_stage =
          signersForContract[0]?.completedOfflineStage();

        // distribute contract share to contract
        const wallet = new Wallet(
          "scan budget lady garlic walnut whisper coin noodle leg tenant bicycle turtle",
        );

        const homeChainId = this.walletsStore.currentChainId;

        const url = SecretJsChains[homeChainId].urls[0],
          signerContractAddress =
            SecretJsChains[homeChainId].secretSigner.address,
          signerContractAddressHash =
            SecretJsChains[homeChainId].secretSigner.codeHash;

        const secretjs = new SecretNetworkClient({
          url: url as string,
          chainId: homeChainId,
          wallet: wallet,
          walletAddress: wallet.address,
        });

        let setShareMsg = {
          set_shares: {
            contract_signers_completed_offline_stage,
            user_entry_address: this.walletsStore.address,
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

        if (tx.code === 0) return { success: true, gasUsed: tx.gasUsed };
        else throw new Error(`Error on share key to contract: ${tx.rawLog}`);
      }
    } catch (error) {
      throw console.log(`Error on share key to contract:`, error);
    }
  }
}
