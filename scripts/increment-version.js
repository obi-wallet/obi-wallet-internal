const fs = require("fs");
const path = require("path");
const semver = require("semver");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const stat = util.promisify(fs.stat);

(async () => {
  const releaseType = process.argv[2];

  const appsPath = path.join(__dirname, "../apps");
  const directories = ["loop-mobile", "obi-mobile"];
  await Promise.all(
    directories.map(async (directory) => {
      const appPath = path.join(appsPath, directory);
      const s = await stat(appPath);

      async function handleIos() {
        const file = path.join(appPath, "ios/Mobile.xcodeproj/project.pbxproj");
        const input = await readFile(file, "utf8");
        const versionRe = /MARKETING_VERSION = (.+);/g;
        const buildNumberRe = /CURRENT_PROJECT_VERSION = (.+);/g;

        const currentVersion = versionRe.exec(input)[1];
        const newVersion = releaseType
          ? semver.inc(currentVersion, releaseType)
          : currentVersion;

        const currentBuildNumber = buildNumberRe.exec(input)[1];
        const newBuildNumber = parseInt(currentBuildNumber, 10) + 1;

        const output = input
          .replace(versionRe, `MARKETING_VERSION = ${newVersion};`)
          .replace(
            buildNumberRe,
            `CURRENT_PROJECT_VERSION = ${newBuildNumber};`
          );

        await writeFile(file, output, "utf8");
      }

      async function handleAndroid() {
        const file = path.join(appPath, "android/app/build.gradle");
        const input = await readFile(file, "utf8");
        const versionRe = /versionName "(.+)"/;
        const buildNumberRe = /versionCode (.+)/;

        const currentVersion = versionRe.exec(input)[1];
        const newVersion = releaseType
          ? semver.inc(currentVersion, releaseType)
          : currentVersion;

        const currentBuildNumber = buildNumberRe.exec(input)[1];
        const newBuildNumber = parseInt(currentBuildNumber, 10) + 1;

        const output = input
          .replace(versionRe, `versionName "${newVersion}"`)
          .replace(buildNumberRe, `versionCode ${newBuildNumber}`);

        await writeFile(file, output, "utf8");
      }

      if (s.isDirectory()) {
        await Promise.all([handleIos(), handleAndroid()]);
      }
    })
  );
})();
