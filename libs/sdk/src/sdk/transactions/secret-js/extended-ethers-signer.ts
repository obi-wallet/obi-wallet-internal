import { Wallet, BytesLike, utils } from "ethers5";
import { SignAndBroadcastTransactionUserInteraction } from "libs/sdk/src/user-interactions";
import { useStore } from "libs/common/src/contexts";
import invariant from "tiny-invariant";
import { providers } from "ethers5";

export class ExtendedWallet extends Wallet {
    public override provider: providers.JsonRpcProvider;

    constructor(address: string, provider: providers.JsonRpcProvider) {
        // we don't have a private key here!
        super(address, provider);
        this.provider = provider;
      }

    override async getAddress(): Promise<string> {
        const { walletsStore } = useStore();
        invariant(walletsStore.currentWallet?.evmSigningAddress, "no signing address in store");
        return walletsStore.currentWallet?.evmSigningAddress;
    }

    override async signMessage(message: BytesLike ): Promise<string> {
        const { walletsStore } = useStore();
        invariant(walletsStore.currentWallet?.meta, "no wallet meta");
        const { signature } = await SignAndBroadcastTransactionUserInteraction.start({
            messages: [{ raw: message }],
            demoMode: false,
            cancelable: false,
            walletMeta: walletsStore.currentWallet?.meta,
        })
        invariant(signature, "No signature obtained");
        return utils.hexlify(signature);
    }
}