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
  to: Caip19AssetId;
}> {
  public setSimulationResponse({
    from,
    to,
  }: {
    from: { asset: Caip19AssetId; rawAmount: string; prettyAmount: string };
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

// TODO: needs simulation response (i.e., fromAsset & amount, toAsset & amount, deposit address)
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

  public setAddress() {
    return Effect.gen(this, function* () {
      const state = yield* TunnelState;
      yield* state.set((_) => {
        return new StatusState({
          previousState: this,
        });
      });
    });
  }
}

// TODO: needs recipient address, and probably all information from ChooseAddressState
export class StatusState extends Data.TaggedClass(TunnelStateType.Status)<{
  previousState: ChooseAddressState;
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
