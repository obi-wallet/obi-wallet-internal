import path from "node:path";
import { fileURLToPath } from "node:url";

import { execCommand, modifyFile, spawnCommand } from "./helpers.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

(async () => {
  const appDir = path.join(__dirname, "../apps/obi-mobile");

  // Increment codepush version
  const [deployment] = JSON.parse(
    await execCommand(
      "appcenter codepush deployment list -a Obi-Money/obi-mobile-android --output json"
    )
  );
  const label = deployment.latestRelease.label;
  const version = parseInt(label.replace("v", ""), 10);
  const newVersion = version + 1;

  // Handle src/main.tsx
  await modifyFile(path.join(appDir, "src/main.tsx"), async (input) => {
    const versionRe = /const codepushVersion = "(.+)"/;
    return input.replace(versionRe, `const codepushVersion = "${newVersion}"`);
  });

  // Codepush
  await Promise.all([
    execCommand(
      "appcenter codepush release-react -a Obi-Money/obi-mobile-android -d Staging -e ./src/main.tsx --sourcemap-output --output-dir ./build/android",
      { cwd: appDir }
    ),
    execCommand(
      "appcenter codepush release-react -a Obi-Money/obi-mobile-ios -d Staging -e ./src/main.tsx --xcode-project-file ios/Mobile.xcodeproj/project.pbxproj -p ios/Mobile/Info.plist --sourcemap-output --output-dir ./build/ios",
      { cwd: appDir }
    ),
  ]);

  // Sentry release
  await Promise.all([
    spawnCommand(
      "sentry-cli",
      [
        "react-native",
        "appcenter",
        "Obi-Money/obi-mobile-android",
        "android",
        "./build/android/CodePush",
        "--deployment",
        "Staging",
        "--dist",
        newVersion,
      ],
      {
        cwd: appDir,
        env: {
          ...process.env,
          SENTRY_PROPERTIES: "./android/sentry.properties",
        },
      }
    ),
    spawnCommand(
      "sentry-cli",
      [
        "react-native",
        "appcenter",
        "Obi-Money/obi-mobile-ios",
        "ios",
        "./build/ios/CodePush",
        "--deployment",
        "Staging",
        "--dist",
        newVersion,
      ],
      {
        cwd: appDir,
        env: { ...process.env, SENTRY_PROPERTIES: "./ios/sentry.properties" },
      }
    ),
  ]);
})();
