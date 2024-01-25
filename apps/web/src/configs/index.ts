export type THEMES = "obi" | "noble";

export const THEME_CONFIGS = {
  obi: {
    value: "obi",
    logo: "/assets/images/logo-obi.png",
  },
  noble: {
    value: "noble",
    logo: "/assets/images/logo-noble.png",
  },
};

const themeId: THEMES = (process.env.THEME || "obi") as THEMES;

console.log({ themeId });
export const CURRENT_THEME = THEME_CONFIGS[themeId];
