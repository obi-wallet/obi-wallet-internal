import childProcess from "node:child_process";
import fs from "node:fs";
import util from "node:util";

const exec = util.promisify(childProcess.exec);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

export async function get1PasswordItem(id) {
  return JSON.parse(
    await execCommand(
      `op item get ${id} --account AURDFTDQCVHDRIBVN3MRH5PSFA --format json`,
    ),
  );
}

export async function download1PasswordFile(id, outFile) {
  try {
    await unlink(outFile);
  } catch (e) {
    // noop
  }
  await execCommand(
    `op document get ${id} --account AURDFTDQCVHDRIBVN3MRH5PSFA --out-file ${outFile}`,
  );
}

export async function execCommand(command, options) {
  const { stdout } = await exec(command, options);
  return stdout;
}

export async function spawnCommand(command, args, options = {}) {
  const p = childProcess.spawn(command, args, { ...options, stdio: "inherit" });
  return new Promise((resolve, reject) => {
    p.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
  });
}

export async function modifyFile(path, f) {
  async function getInput() {
    try {
      return await readFile(path, "utf8");
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      return undefined;
    }
  }

  const input = await getInput();
  const output = await f(input);
  await writeFile(path, output, "utf8");
}
