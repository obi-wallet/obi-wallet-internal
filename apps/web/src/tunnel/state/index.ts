import { EffectState } from "@/effect/effect-state";
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

// TODO: needs FromAsset
export class ChooseAssetState extends Data.TaggedClass(
  TunnelStateType.ChooseAsset,
) {
  public setSimulationResponse() {
    return Effect.gen(this, function* () {
      const state = yield* TunnelState;
      yield* state.set((_) => {
        return new ChooseAddressState({
          previousState: this,
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
