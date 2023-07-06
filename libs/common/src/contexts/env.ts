import { createContext, useContext } from "react";

export interface Env {
  PHONE_NUMBER_KEY_SECRET: string;
  PHONE_NUMBER_TWILIO_BASIC_AUTH_USER: string;
  PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD: string;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const EnvContext = createContext<Env>(null!);

export function useEnv() {
  return useContext(EnvContext);
}
