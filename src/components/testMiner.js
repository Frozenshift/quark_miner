import { getSecureRandomBytes } from "@ton/crypto";
import { execSync } from "child_process";
import fs from "fs";

export async function testMiner(bin, gpu, timeout) {
  const randomName = (await getSecureRandomBytes(8)).toString("hex") + ".boc";
  const path = `bocs/${randomName}`;
  const command = `${bin} -g ${gpu} -F 128 -v -t ${timeout} kQBWkNKqzCAwA9vjMwRmg7aY75Rf8lByPA9zKXoqGkHi8SM7 229760179690128740373110445116482216837 53919893334301279589334030174039261347274288845081144962207220498400000000000 10000000000 kQBWkNKqzCAwA9vjMwRmg7aY75Rf8lByPA9zKXoqGkHi8SM7 ${path}`;
  try {
    const output = execSync(command, { encoding: "utf-8", stdio: "pipe" });
  } catch (e) {}
  let mined = undefined;
  try {
    mined = fs.readFileSync(path);
    fs.rmSync(path);
  } catch (e) {}
  if (!mined) {
    return false;
  }

  return true;
}
