import type { SessionOptions } from "iron-session";

export interface SessionData {
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.ANALYTICS_AUTHENTICATION_IRON_SESSION_SECRET!,
  cookieName: "analytics-auth",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
