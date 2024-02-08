import { createContext, useContext } from "react";
import invariant from "tiny-invariant";

export interface Env {
  PHONE_NUMBER_KEY_SECRET: string;
  PHONE_NUMBER_TWILIO_BASIC_AUTH_USER: string;
  PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD: string;
  THEME: string;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const EnvContext = createContext<Env | null>(null);

export function useEnv() {
  const ctx = useContext(EnvContext);
  invariant(ctx, "Env context is null");
  return ctx;
}
