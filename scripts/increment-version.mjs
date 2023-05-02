import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import util from "node:util";
import semver from "semver";

import { modifyFile, spawnCommand } from "./helpers.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const stat = util.promisify(fs.stat);

(async () => {
  const releaseType = process.argv[2];

  const appsPath = path.join(__dirname, "../apps");
  const directories = ["obi-mobile"];
  await Promise.all(
    directories.map(async (directory) => {
      const appPath = path.join(appsPath, directory);
      const s = await stat(appPath);

      async function syncDeps() {
        await spawnCommand("nx", ["sync-deps", directory]);
      }

      async function handlePodInstall() {
        await spawnCommand("pod", ["install"], {
          cwd: path.join(appPath, "ios"),
        });
      }

      async function handleMain() {
        await modifyFile(path.join(appPath, "src/main.tsx"), async (input) => {
          const versionRe = /const version = "(.+)"/;

          const currentVersion = versionRe.exec(input)[1];
          const newVersion = releaseType
            ? semver.inc(currentVersion, releaseType)
            : currentVersion;

          return input.replace(versionRe, `const version = "${newVersion}"`);
        });
      }

      async function handleIos() {
        await modifyFile(
          path.join(appPath, "ios/Mobile.xcodeproj/project.pbxproj"),
          async (input) => {
            const versionRe = /MARKETING_VERSION = (.+);/g;
            const buildNumberRe = /CURRENT_PROJECT_VERSION = (.+);/g;

            const currentVersion = versionRe.exec(input)[1];
            const newVersion = releaseType
              ? semver.inc(currentVersion, releaseType)
              : currentVersion;

            const currentBuildNumber = buildNumberRe.exec(input)[1];
            const newBuildNumber = parseInt(currentBuildNumber, 10) + 1;

            return input
              .replace(versionRe, `MARKETING_VERSION = ${newVersion};`)
              .replace(
                buildNumberRe,
                `CURRENT_PROJECT_VERSION = ${newBuildNumber};`
              );
          }
        );
      }

      async function handleAndroid() {
        await modifyFile(
          path.join(appPath, "android/app/build.gradle"),
          async (input) => {
            const versionRe = /versionName "(.+)"/;
            const buildNumberRe = /versionCode (.+)/;

            const currentVersion = versionRe.exec(input)[1];
            const newVersion = releaseType
              ? semver.inc(currentVersion, releaseType)
              : currentVersion;

            const currentBuildNumber = buildNumberRe.exec(input)[1];
            const newBuildNumber = parseInt(currentBuildNumber, 10) + 1;

            return input
              .replace(versionRe, `versionName "${newVersion}"`)
              .replace(buildNumberRe, `versionCode ${newBuildNumber}`);
          }
        );
      }

      if (s.isDirectory()) {
        await syncDeps();
        await handlePodInstall();
        await Promise.all([handleMain(), handleIos(), handleAndroid()]);
      }
    })
  );
})();
