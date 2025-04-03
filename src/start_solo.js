import { logger } from "./logger.js";
import { getPowInfo } from "./components/getPowInfo.js";
import { Address } from "@ton/ton";
import { sleep } from "./utils/utils.js";
import { getSecureRandomBytes } from "@ton/crypto";
import { execSync } from "child_process";
import fs from "fs";
import { CallForSuccess } from "./components/callForSuccess.js";
import { sendMinedBoc } from "./components/sendMinedBoc.js";
import { Cell } from "@ton/core";
import { bestGiver, updateBestGivers } from "./components/bestGiver.js";

export const soloGpu = async (
  wallet,
  allowMining,
  liteClient,
  timeout,
  bin,
  gpu,
  keyPair,
  givers,
) => {
  let lastMinedSeed = BigInt(0);
  let i = 1;
  let success = 0;
  const targetAddress = wallet.address.toString({
    bounceable: false,
    urlSafe: true,
  });

  while (allowMining) {
    const giverAddress = bestGiver.address;
    const [seed, complexity, iterations] = await getPowInfo(
      liteClient,
      Address.parse(giverAddress),
    );
    if (seed === lastMinedSeed) {
      await updateBestGivers(givers);
      await sleep(200);
      continue;
    }
    const randomName = (await getSecureRandomBytes(8)).toString("hex") + ".boc";
    const path = `bocs/${randomName}`;
    const command = `${bin} -g ${gpu} -F 128 -t ${timeout} ${targetAddress} ${seed} ${complexity} ${iterations} ${giverAddress} ${path}`;
    try {
      const output = execSync(command, { encoding: "utf-8", stdio: "pipe" });
    } catch (e) {}

    let mined = undefined;
    try {
      mined = fs.readFileSync(path);
      lastMinedSeed = seed;
      fs.rmSync(path);
    } catch (e) {
      //
    }
    if (!mined) {
      logger.warn(
        `Not mined | Total success count: ${success} | Attempts : ${i}`,
      );
    }
    if (mined) {
      success++;
      const [newSeed] = await getPowInfo(
        liteClient,
        Address.parse(giverAddress),
      );
      if (newSeed !== seed) {
        logger.warn("Mined already too late seed");
        continue;
      }
      logger.info(`Mined | Total success count: ${success} | Attempts : ${i}`);
      let seqno = 0;

      let w = liteClient.open(wallet);
      try {
        seqno = await CallForSuccess(() => w.getSeqno());
      } catch (e) {
        //
      }
      await sendMinedBoc(
        wallet,
        seqno,
        keyPair,
        giverAddress,
        Cell.fromBoc(mined)[0].asSlice().loadRef(),
      );
    }
    i++;
    await sleep(timeout);
  }
};
