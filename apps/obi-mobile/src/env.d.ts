declare module "react-native-dotenv" {
  export const APP_ENV: "development" | "staging" | "production";
  export const COSMOS_ENABLED: "true" | undefined;

  export const PHONE_NUMBER_KEY_SECRET: string;
  export const PHONE_NUMBER_TWILIO_BASIC_AUTH_USER: string;
  export const PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD: string;

  export const IOS_APP_CENTER_DEPLOYMENT_KEY_STAGING: string;
  export const IOS_APP_CENTER_DEPLOYMENT_KEY_PRODUCTION: string;
  export const ANDROID_APP_CENTER_DEPLOYMENT_KEY_STAGING: string;
  export const ANDROID_APP_CENTER_DEPLOYMENT_KEY_PRODUCTION: string;

  export const SENTRY_DSN: string;
}
