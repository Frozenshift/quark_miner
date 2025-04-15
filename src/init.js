import dotenv from "dotenv";
import { logger } from "./logger.js";
import { getUserGivers } from "./components/getUserGivers.js";
import { getGpu } from "./components/getGpu.js";
import { testMiner } from "./components/testMiner.js";
import { logo } from "./components/logo.js";
import { checkMnemonic } from "./components/checkMnemonic.js";
import { WalletContractV4 } from "@ton/ton";
import { getLiteClient } from "./components/getLiteClient.js";
import { compareVersions, sleep } from "./utils/utils.js";

import { soloGpu } from "./start_solo.js";
import { updateBestGivers } from "./components/bestGiver.js";
import { multiGpu } from "./start_multi.js";

dotenv.config({ path: "config.txt" });

const MIN_NODE_VERSION = "20.0.0";
if (!compareVersions(MIN_NODE_VERSION)) {
  logger.error(`❗ Требуется Node.js ${MIN_NODE_VERSION} или выше`);
  process.exit(1);
} else {
  logger.info(`Node js version: ${process.versions.node}`);
}

const UUID = process.env.UUID;
const GPU__COUNT = process.env.GPU__COUNT;
const GPU__VENDOR = process.env.GPU__VENDOR;
const liteClient = await getLiteClient(
  "https://ton-blockchain.github.io/global.config.json",
);

await logo(logger);
const keyPair = await checkMnemonic(process.env.SEED);
const wallet = WalletContractV4.create({
  workchain: 0,
  publicKey: keyPair.publicKey,
});

logger.info(
  `Using v4r2 wallet ${wallet.address.toString({ bounceable: false, urlSafe: true })}`,
);

if (!UUID) {
  logger.error("UUID not found");
  process.exit(1);
}
let bin = ".\\src\\bin\\pow-miner-cuda.exe";
let givers = await getUserGivers(UUID);
let gpuVendor = "NVIDIA";

const userGpu = await getGpu();
userGpu.forEach((gpu, index) => {
  logger.info(`[${index}] GPU: ${gpu.vendor} (${gpu.model})`);
  gpuVendor = gpu.vendor;
});
let gpu = userGpu.length - 1;
let timeout = 10;

if (GPU__COUNT) {
  console.log(GPU__COUNT);
  gpu = GPU__COUNT;
}
if (GPU__VENDOR) {
  console.log(GPU__VENDOR);
  gpuVendor = GPU__VENDOR;
}

if (process.platform === "win32") {
  if (gpuVendor === "NVIDIA") {
    bin = ".\\src\\bin\\pow-miner-cuda.exe";
    logger.info(`OS: Windows, GPU VENDOR: ${gpuVendor}`);
  } else {
    bin = ".\\src\\bin\\pow-miner-opencl.exe";
    logger.info(`OS: Windows, GPU VENDOR: ${gpuVendor}`);
  }
} else if (process.platform === "linux") {
  if (gpuVendor === "NVIDIA") {
    bin = "./src/bin/pow-miner-cuda";
    logger.info(`OS: Linux, GPU VENDOR: ${gpuVendor}`);
  } else {
    bin = "./src/bin/pow-miner-opencl";
    logger.info(`OS: Linux, GPU VENDOR: ${gpuVendor}`);
  }
} else if (process.platform === "darwin") {
  bin = "./src/bin/pow-miner-opencl-macos";
  logger.warn(`OS: Mac OS, GPU VENDOR: ${gpuVendor}`);
} else {
  logger.error("Неизвестная ОС");
}

const allowMining = await testMiner(bin, 0, timeout);
if (allowMining) {
  logger.info(`Miner status: OK`);
} else {
  logger.error(`Miner status: ERROR`);
}

try {
  await updateBestGivers(givers);
  setInterval(async () => {
    givers = await getUserGivers(UUID);
    await updateBestGivers(givers);
  }, 5000);
} catch (e) {
  logger.error(e);
}
if (gpu === 1) {
  logger.info(`Start solo gpu mining`);
  soloGpu(wallet, allowMining, liteClient, timeout, bin, 0, keyPair, givers);
} else {
  logger.info(`Start multi GPU mining: ${gpu}`);
  multiGpu(wallet, allowMining, liteClient, timeout, bin, gpu, keyPair, givers);
}
