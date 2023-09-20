import { MultisigKey } from "../../data-structures";

/**
 * Methods are proxied by {@link WalletsSdk}.
 *
 * @internal
 */
export abstract class AbstractWalletsSdk {
  public abstract getAsyncDetailsAndFirstOwnerUpdate({
    multisigKey,
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<{
    homeAccountAddress: string;
    evmSignerAddress: string;
    evmUserContractAddress: string;
  }>;
}
