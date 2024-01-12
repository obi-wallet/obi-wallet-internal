import path from "node:path";
import { fileURLToPath } from "node:url";

import { get1PasswordItem, getField, modifyFile } from "./helpers.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

(async () => {
  if (process.env.CI === "true") return;

  // Handle apps/web/.env
  await modifyFile(path.join(__dirname, "../apps/web/.env"), async () => {
    const { fields } = await get1PasswordItem("m25pudvyrvnsfd2u3emjjsi7ja");
    return getField({ fields, label: "notesPlain" }).value;
  });
})();
