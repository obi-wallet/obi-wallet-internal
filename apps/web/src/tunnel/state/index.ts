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
