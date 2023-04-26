import childProcess from "node:child_process";
import fs from "node:fs";
import util from "node:util";

const exec = util.promisify(childProcess.exec);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

export async function get1PasswordItem(id) {
  return JSON.parse(await execCommand(
    `op item get ${id} --account AURDFTDQCVHDRIBVN3MRH5PSFA --format json`
  ));
}

export async function download1PasswordFile(id, outFile) {
  await unlink(outFile);
  await execCommand(`op document get ${id} --account AURDFTDQCVHDRIBVN3MRH5PSFA --out-file ${outFile}`);
}

export async function execCommand(command) {
  const { stdout, stderr } = await exec(command);
  if (stderr) throw new Error(stderr);
  return stdout;
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
