"use client";

import { useEffectState } from "@/effect/effect-state";
import { SecretJsHomeChainId } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";

import { InitialState, OnboardingState, OnboardingStateType } from "./state";
import { CreateWalletStep } from "./state-handler/create-wallet";
import { PrimaryKeyStep } from "./state-handler/primary-key";
import { UserDataStep } from "./state-handler/user-data";

const initialState = new InitialState({
  chainId: SecretJsHomeChainId.MAINNET,
  initialName: "",
});

export const Onboarding = observer(function Onboarding() {
  const { state, dispatch } = useEffectState(OnboardingState, initialState);

  if (state._tag === OnboardingStateType.Initial) {
    return <UserDataStep state={state} dispatch={dispatch} />;
  }

  if (state._tag === OnboardingStateType.PrimaryKey) {
    return <PrimaryKeyStep state={state} dispatch={dispatch} />;
  }

  if (state._tag === OnboardingStateType.CreateWallet) {
    return <CreateWalletStep state={state} dispatch={dispatch} />;
  }
});
