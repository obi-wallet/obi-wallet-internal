import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  download1PasswordFile,
  execCommand,
  get1PasswordItem,
  getField,
  modifyFile,
} from "./helpers.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

(async () => {
  if (process.env.CI === "true") return;

  const appDir = path.join(__dirname, "../apps/obi-mobile");
  const { fields } = await get1PasswordItem("di22m5775squt3l34ep477fl4e");

  // Handle .env
  await modifyFile(path.join(appDir, ".env"), async (input) => {
    let result = input ?? "APP_ENV=development\nCOSMOS_ENABLED=true\n";

    fields.forEach(({ type, label, value }) => {
      if (type !== "CONCEALED") return;

      const fieldRe = new RegExp(`${label}=(.+)`);
      result = result.replace(fieldRe, "");
      result = result + `${label}=${value}\n`;
    });

    result =
      result
        .split("\n")
        .filter((line) => line !== "")
        .join("\n") + "\n";

    return result;
  });

  await copyFile(
    path.join(appDir, ".env"),
    path.join(__dirname, "../libs/modal/.env"),
  );
  await copyFile(
    path.join(appDir, ".env"),
    path.join(__dirname, "../apps/modal-web/.env"),
  );

  // Handle ios/Mobile/AppCenter-Config.plist
  await modifyFile(
    path.join(appDir, "ios/Mobile/AppCenter-Config.plist"),
    async () => {
      const field = getField({ fields, label: "IOS_APP_CENTER_SECRET" });
      return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "https://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
    <key>AppSecret</key>
    <string>${field.value}</string>
    </dict>
</plist>
`;
    },
  );

  // Handle android/app/src/main/assets/appcenter-config.json
  await modifyFile(
    path.join(appDir, "android/app/src/main/assets/appcenter-config.json"),
    async () => {
      const field = getField({ fields, label: "ANDROID_APP_CENTER_SECRET" });
      return `{
  "app_secret": "${field.value}"
}
`;
    },
  );

  const androidSigningKeystore = await get1PasswordItem(
    "m4xgsyqjpzbgbs4s5qbwkq3pgy",
  );

  // Handle android/local.properties
  await modifyFile(
    path.join(appDir, "android/local.properties"),
    async (input) => {
      let result = input ?? "";

      androidSigningKeystore.fields.forEach(({ type, label, value }) => {
        if (type !== "CONCEALED") return;

        const fieldRe = new RegExp(`${label}=(.+)`);
        result = result.replace(fieldRe, "");
        result = result + `${label}=${value}\n`;
      });

      result =
        result
          .split("\n")
          .filter((line) => line !== "")
          .join("\n") + "\n";

      return result;
    },
  );

  // Handle android/app/<KEYSTORE_NAME>.keystore
  await download1PasswordFile(
    "m4xgsyqjpzbgbs4s5qbwkq3pgy",
    path.join(appDir, `android/app/${androidSigningKeystore.files[0].name}`),
  );

  // Handle ios/sentry.properties
  await download1PasswordFile(
    "m3blhrmel4shejdaayto7b5bou",
    path.join(appDir, "ios/sentry.properties"),
  );

  // Handle android/sentry.properties
  await download1PasswordFile(
    "m3blhrmel4shejdaayto7b5bou",
    path.join(appDir, "android/sentry.properties"),
  );

  // Handle libs/mobile/cosmos.userdeps.js
  await execCommand(
    `touch ${path.join(__dirname, "..", "libs/mobile/cosmos.userdeps.js")}`,
  );

  // Handle apps/modal-web/.env
  await modifyFile(path.join(__dirname, "../apps/modal-web/.env"), async () => {
    const { fields } = await get1PasswordItem("m25pudvyrvnsfd2u3emjjsi7ja");
    return getField({ fields, label: "notesPlain" }).value;
  });
})();
