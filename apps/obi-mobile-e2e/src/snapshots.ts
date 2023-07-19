import { device } from "detox";
import fs from "fs";
import path from "path";
import yargsParser from "yargs-parser";

test("WelcomeScreen", async () => {
  await device.launchApp({
    launchArgs: {
      fixture: "__fixtures__/screens/welcome.tsx",
    },
  });
  await expectScreenshotSnapshotToEqual({ name: "welcome-screen" });
});

async function expectScreenshotSnapshotToEqual({ name }: { name: string }) {
  const deviceType = getDeviceType();

  const snapshottedImagePath = path.join(
    __dirname,
    `../snapshots/${deviceType}/${name}.png`,
  );

  const imagePath = await element(by.id("detox-container")).takeScreenshot(
    name,
  );
  expectBitmapsToBeEqual(imagePath, snapshottedImagePath);
}

function expectBitmapsToBeEqual(imagePath, expectedImagePath) {
  const argv = yargsParser(process.argv.slice(2));
  const copyFile =
    argv.updateSnapshot === "true" || !fs.existsSync(expectedImagePath);

  if (copyFile) {
    fs.copyFileSync(imagePath, expectedImagePath);
  } else {
    const bitmapBuffer = fs.readFileSync(imagePath);
    const expectedBitmapBuffer = fs.readFileSync(expectedImagePath);
    if (!bitmapBuffer.equals(expectedBitmapBuffer)) {
      throw new Error(
        `Expected image at ${imagePath} to be equal to image at ${expectedImagePath}, but it was different!`,
      );
    }
  }
}

enum DeviceType {
  IosSmall = "ios-small",
  IosLarge = "ios-large",
}

function getDeviceType() {
  const name = device.name;

  if (name.includes("(iPhone SE (3rd generation)")) {
    return DeviceType.IosSmall;
  }
  if (name.includes("(iPhone 14 Pro Max)")) {
    return DeviceType.IosLarge;
  }
}
