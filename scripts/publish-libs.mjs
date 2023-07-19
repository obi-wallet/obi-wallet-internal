import { execCommand, modifyFile, spawnCommand } from "./helpers.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

(async () => {
  await spawnCommand("nx", ["build", "modal"]);

  let { version } = JSON.parse(
    await fs.readFile(path.join(__dirname, "../libs/modal/package.json"), {
      encoding: "utf-8",
    }),
  );
  const sha = (await execCommand("git rev-parse --short HEAD")).trim();
  version += `-0.${sha}`;

  const distPath = path.join(__dirname, "../dist/libs");
  const libs = ["common", "config", "headless-ui", "modal", "sdk", "theme"];
  await Promise.all(
    libs.map(async (lib) => {
      await modifyFile(
        path.join(distPath, lib, "package.json"),
        async (input) => {
          const parsedInput = JSON.parse(input);
          parsedInput.version = version;
          for (let lib of libs) {
            if (parsedInput.dependencies[`@obi-wallet/${lib}`]) {
              parsedInput.dependencies[`@obi-wallet/${lib}`] = version;
            }
          }
          return JSON.stringify(parsedInput, null, 2);
        },
      );
    }),
  );

  await Promise.all(
    libs.map(async (lib) => {
      await spawnCommand("npm", ["publish"], {
        cwd: path.join(distPath, lib),
      });
    }),
  );
})();
