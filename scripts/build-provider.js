const fs = require("fs");
const path = require("path");

const dist = path.join(
  __dirname,
  "../libs/injected-provider/dist/injected-provider.js"
);
const bundle = fs.readFileSync(dist, "utf8");
const content = `export const bundle = ${JSON.stringify(bundle)};
`;

const mobileApps = ["loop-mobile", "loop-mobile-dev"];
mobileApps.forEach((app) => {
  const output = path.join(
    __dirname,
    "../apps/",
    app,
    "/src/app/injected-provider/bundle.ts"
  );
  fs.writeFileSync(output, content, "utf8");
});
