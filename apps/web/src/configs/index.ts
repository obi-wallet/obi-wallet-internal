export type THEMES = "obi" | "noble";

export const THEME_CONFIGS = {
  obi: {
    value: "obi",
    logo: "/assets/images/logo-obi.png",
    explaination: {
      title: "What is an Obi Account?",
      description:
        "Obi Smart Accounts are a convenient and secure way to custody your crypto assets without the risk and hassle of seed phrases or private keys.",
    },
  },
  noble: {
    value: "noble",
    logo: "/assets/images/logo-noble.png",
    explaination: {
      title: "What is a Noble Account?",
      description:
        "Noble Accounts are a convenient and secure way to custody your digital assets without the risk and hassle of seed phrases or private keys.",
    },
  },
};

const themeId: THEMES = (process.env.NEXT_PUBLIC_THEME || "obi") as THEMES;

export const CURRENT_THEME = THEME_CONFIGS[themeId];
