import { EffectState } from "@/effect/effect-state";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { Context, Data, Effect } from "effect";

export enum TunnelStateType {
  ChooseAsset = "ChooseAsset",
  ChooseAddress = "ChooseAddress",
  Status = "Status",
}

export class TunnelState extends Context.Tag("TunnelState")<
  TunnelState,
  EffectState<ChooseAssetState | ChooseAddressState | StatusState>
>() {}

export class ChooseAssetState extends Data.TaggedClass(
  TunnelStateType.ChooseAsset,
)<{
  from: Caip19AssetId;
  to: Caip19AssetId;
}> {
  public setSimulationResponse({
    from,
    to,
  }: {
    from: {
      asset: Caip19AssetId;
      rawAmount: string;
      prettyAmount: string;
    };
    to: { asset: Caip19AssetId; rawAmount: string; prettyAmount: string };
  }) {
    return Effect.gen(this, function* () {
      const state = yield* TunnelState;
      yield* state.set((_) => {
        return new ChooseAddressState({
          previousState: this,
          from,
          to,
        });
      });
    });
  }
}

export class ChooseAddressState extends Data.TaggedClass(
  TunnelStateType.ChooseAddress,
)<{
  previousState: ChooseAssetState;
  from: {
    asset: Caip19AssetId;
    rawAmount: string;
    prettyAmount: string;
  };
  to: {
    asset: Caip19AssetId;
    rawAmount: string;
    prettyAmount: string;
  };
}> {
  public back() {
    return Effect.gen(this, function* () {
      const state = yield* TunnelState;
      yield* state.set((_) => {
        return this.previousState;
      });
    });
  }

  public setAddress({
    fromAddress,
    toAddress,
    toPublicKey,
    walletType,
  }: {
    fromAddress: string;
    toAddress: string;
    toPublicKey?: string | undefined;
    walletType?: "obi" | "phantom" | undefined;
  }) {
    return Effect.gen(this, function* () {
      const state = yield* TunnelState;
      yield* state.set((_) => {
        return new StatusState({
          previousState: this,
          from: {
            ...this.from,
            address: fromAddress,
          },
          to: {
            ...this.to,
            address: toAddress,
            publicKey: toPublicKey,
          },
          walletType,
        });
      });
    });
  }
}

export class StatusState extends Data.TaggedClass(TunnelStateType.Status)<{
  previousState: ChooseAddressState;
  from: {
    asset: Caip19AssetId;
    rawAmount: string;
    prettyAmount: string;
    address: string;
  };
  to: {
    asset: Caip19AssetId;
    rawAmount: string;
    prettyAmount: string;
    address: string;
    publicKey?: string | undefined;
  };
  walletType?: "obi" | "phantom" | undefined;
}> {
  public back() {
    return Effect.gen(this, function* () {
      const state = yield* TunnelState;
      yield* state.set((_) => {
        return this.previousState;
      });
    });
  }
}
