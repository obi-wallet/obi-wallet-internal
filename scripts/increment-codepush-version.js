const fs = require("fs");
const path = require("path");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const exec = util.promisify(require("child_process").exec);

(async () => {
  const { stdout } = await exec(
    "appcenter codepush deployment list -a Obi-Money/obi-mobile-android --output json"
  );
  const [deployment] = JSON.parse(stdout);
  const label = deployment.latestRelease.label;
  const version = parseInt(label.replace("v", ""), 10);
  const newVersion = version + 1;

  const appPath = path.join(__dirname, "../apps/obi-mobile");
  const file = path.join(appPath, "src/main.tsx");
  const input = await readFile(file, "utf8");

  const versionRe = /const codepushVersion = "(.+)"/;
  const output = input.replace(
    versionRe,
    `const codepushVersion = "${newVersion}"`
  );

  await writeFile(file, output, "utf8");
})();
