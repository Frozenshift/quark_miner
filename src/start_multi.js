import { logger } from "./logger.js";
import { Address } from "@ton/ton";
import { getSecureRandomBytes } from "@ton/crypto";
import { spawn } from "child_process";
import fs from "fs";
import { Cell } from "@ton/core";
import { sleep } from "./utils/utils.js";
import { CallForSuccess } from "./components/callForSuccess.js";
import { sendMinedBoc } from "./components/sendMinedBoc.js";
import { getPowInfo } from "./components/getPowInfo.js";
import { bestGiver, updateBestGivers } from "./components/bestGiver.js";

export const multiGpu = async (
  wallet,
  allowMining,
  liteClient,
  timeout,
  bin,
  gpuCount,
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

    const mined = await new Promise(async (resolve) => {
      let remainingGpus = gpuCount;
      const handlers = [];

      for (let gpuId = 0; gpuId < gpuCount; gpuId++) {
        const randomName =
          (await getSecureRandomBytes(8)).toString("hex") + ".boc";
        const path = `bocs/${randomName}`;
        const command = `-g ${gpuId} -F 128 -t ${timeout} ${targetAddress} ${seed} ${complexity} ${iterations} ${giverAddress} ${path}`;

        const proc = spawn(bin, command.split(" "), { stdio: "pipe" });
        handlers.push(proc);

        proc.on("exit", () => {
          try {
            if (fs.existsSync(path)) {
              const minedBuffer = fs.readFileSync(path);
              resolve(minedBuffer);
              lastMinedSeed = seed;
              fs.rmSync(path);

              handlers.forEach((handle) => handle.kill("SIGINT"));
            }
          } catch (e) {
            logger.warn(`Not mined: ${e}`);
          } finally {
            if (--remainingGpus === 0) {
              resolve(undefined);
            }
          }
        });
      }
    });

    if (!mined) {
      logger.warn(
        `Not mined | Total success count: ${success} | Attempts: ${i}`,
      );
    } else {
      const [newSeed] = await getPowInfo(
        liteClient,
        Address.parse(giverAddress),
      );

      if (newSeed !== seed) {
        logger.warn("Mined already too late seed");
        process.exit(1);
        continue;
      }

      success++;
      logger.info(`Mined | Total success count: ${success} | Attempts: ${i}`);

      let seqno = 0;
      try {
        const w = liteClient.open(wallet);
        seqno = await CallForSuccess(() => w.getSeqno());
      } catch (e) {
        logger.warn(`Error getting seqno: ${e}`);
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
